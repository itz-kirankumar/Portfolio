// app/api/razorpay/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = await req.json()

  const body = razorpay_order_id + '|' + razorpay_payment_id
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')

  const isValid = expectedSignature === razorpay_signature

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // TODO: Save payment record to Firestore
  // await savePayment({ orderId, paymentId, userId, serviceId })

  return NextResponse.json({ success: true, paymentId: razorpay_payment_id })
}