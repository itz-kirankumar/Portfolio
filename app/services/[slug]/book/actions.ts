'use server'

import { getAdminDb } from '@/lib/admin'
import { BOOKINGS_COLLECTION } from '@/lib/schemas/booking'
import { sendBookingInvite } from '@/lib/calendar-invite'
import crypto from 'crypto'

export async function verifyPayment(
  bookingId: string, 
  paymentId: string, 
  orderId: string, 
  signature: string
) {
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) throw new Error('Razorpay secret not configured')

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(orderId + '|' + paymentId)
    .digest('hex')

  if (generatedSignature !== signature) {
    throw new Error('Invalid signature')
  }

  const db = getAdminDb()
  const ref = db.collection(BOOKINGS_COLLECTION).doc(bookingId)

  // Idempotency: Razorpay can deliver the same success callback more than once
  // (retry, double-tap, back-button). A booking already confirmed with this
  // payment must not send a second invite.
  const existing = await ref.get()
  const prev = existing.exists ? (existing.data() as any) : null
  if (prev?.status === 'confirmed' && prev?.payment?.paymentId === paymentId) {
    return { success: true, alreadyConfirmed: true }
  }

  await ref.update({
    status: 'confirmed',
    'payment.paymentId': paymentId,
    'payment.verifiedAt': Date.now(),
    updatedAt: Date.now()
  })

  // Payment is confirmed. Now send the calendar invite with the Meet link.
  // A failure here must never un-confirm a paid booking, so it is wrapped.
  try {
    const snap = await ref.get()
    const booking = snap.data() as any
    const invite = await sendBookingInvite({
      bookingId,
      serviceTitle: booking.serviceTitle || '1:1 Call',
      guestName: booking.name,
      guestEmail: booking.email,
      notes: booking.notes,
      startISO: booking.startISO,
      endISO: booking.endISO,
    })
    if (invite.ok) {
      await ref.update({
        inviteStatus: 'sent',
        inviteEventId: invite.eventId || '',
        meetLink: invite.meetLink || '',
        inviteError: '',
        updatedAt: Date.now(),
      })
    } else {
      // Visible, recoverable admin state - never a silently unfulfilled payment.
      await ref.update({
        inviteStatus: 'failed',
        inviteError: String(invite.error || 'unknown').slice(0, 500),
        updatedAt: Date.now(),
      })
      console.error('Calendar invite failed for booking', bookingId, invite.error)
    }
  } catch (e: any) {
    await ref.update({
      inviteStatus: 'failed',
      inviteError: String(e?.message || e).slice(0, 500),
      updatedAt: Date.now(),
    }).catch(() => {})
    console.error('Calendar invite error for booking', bookingId, e)
  }

  return { success: true }
}