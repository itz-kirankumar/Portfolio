// app/api/razorpay/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: NextRequest) {
  const { amount, currency = 'INR', serviceId, serviceTitle } = await req.json()

  if (!amount || !serviceId) {
    return NextResponse.json({ error: 'amount and serviceId are required' }, { status: 400 })
  }

  const order = await razorpay.orders.create({
    amount: amount * 100, // paise
    currency,
    receipt: `receipt_${serviceId}_${Date.now()}`,
    notes: { serviceId, serviceTitle },
  })

  return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency })
}