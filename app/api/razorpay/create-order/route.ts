// app/api/razorpay/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export async function POST(req: NextRequest) {
  try {
    // 1. Initialize Razorpay INSIDE the handler so Vercel doesn't crash during build
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    // 2. Parse the request body
    const { amount, currency = 'INR', serviceId, serviceTitle } = await req.json()

    // 3. Validate the input
    if (!amount || !serviceId) {
      return NextResponse.json(
        { error: 'amount and serviceId are required' }, 
        { status: 400 }
      )
    }

    // 4. Create the order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amounts in paise
      currency,
      receipt: `receipt_${serviceId}_${Date.now()}`,
      notes: { serviceId, serviceTitle },
    })

    // 5. Return the order details to the frontend
    return NextResponse.json({ 
      orderId: order.id, 
      amount: order.amount, 
      currency: order.currency 
    })

  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json(
      { error: 'Failed to create Razorpay order' }, 
      { status: 500 }
    )
  }
}