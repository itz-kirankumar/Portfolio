'use server'

import { getAdminDb } from '@/lib/admin'
import { BOOKINGS_COLLECTION } from '@/lib/schemas/booking'
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
  
  await ref.update({
    status: 'confirmed',
    'payment.paymentId': paymentId,
    'payment.verifiedAt': Date.now(),
    updatedAt: Date.now()
  })

  return { success: true }
}