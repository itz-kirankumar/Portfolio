'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { putDoc, deleteDocById } from '@/lib/store'
import { BOOKINGS_COLLECTION, bookingSchema } from '@/lib/schemas/booking'
import { getAdminDb } from '@/lib/admin'
import { sendBookingInvite } from '@/lib/calendar-invite'

/**
 * Owner-triggered recovery for a confirmed booking whose invite failed.
 * Refuses to duplicate an invite that already went out.
 */
export async function resendInvite(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) return { ok: false, error: 'Not authorised.' }

  const db = getAdminDb()
  const ref = db.collection(BOOKINGS_COLLECTION).doc(id)
  const snap = await ref.get()
  if (!snap.exists) return { ok: false, error: 'Booking not found.' }
  const booking = snap.data() as any

  if (booking.status !== 'confirmed') {
    return { ok: false, error: 'Only confirmed bookings have invites.' }
  }
  if (booking.inviteStatus === 'sent' && booking.inviteEventId) {
    return { ok: false, error: 'Invite already sent - not sending a duplicate.' }
  }

  const invite = await sendBookingInvite({
    bookingId: id,
    serviceTitle: booking.serviceTitle || '1:1 Call',
    guestName: booking.name,
    guestEmail: booking.email,
    notes: booking.notes,
    startISO: booking.startISO,
    endISO: booking.endISO,
  })

  if (!invite.ok) {
    await ref.update({ inviteStatus: 'failed', inviteError: String(invite.error || 'unknown').slice(0, 500), updatedAt: Date.now() })
    return { ok: false, error: invite.error || 'Invite failed' }
  }

  await ref.update({
    inviteStatus: 'sent',
    inviteEventId: invite.eventId || '',
    meetLink: invite.meetLink || '',
    inviteError: '',
    updatedAt: Date.now(),
  })
  revalidatePath('/admin/bookings')
  revalidatePath(`/admin/bookings/${id}`)
  return { ok: true }
}

export async function saveBooking(id: string, data: any) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) return { ok: false, error: 'Not authorised.' }
  
  try {
    await putDoc(BOOKINGS_COLLECTION, id, bookingSchema, {
      ...data,
      updatedAt: Date.now()
    })
    
    revalidatePath('/')
    revalidatePath('/admin/bookings')
    revalidatePath(`/admin/bookings/${id}`)
    return { ok: true, id }
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return { ok: false, error: 'Validation failed', issues: err.issues }
    }
    return { ok: false, error: err.message }
  }
}

export async function deleteBooking(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) return { ok: false, error: 'Not authorised.' }
  
  await deleteDocById(BOOKINGS_COLLECTION, id)
  revalidatePath('/')
  revalidatePath('/admin/bookings')
  return { ok: true }
}
