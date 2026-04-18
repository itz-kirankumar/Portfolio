'use client'
// components/payment/RazorpayButton.tsx
import { useState } from 'react'
import type { ServiceContent } from '@/types'

interface Props {
  service: ServiceContent
  ownerName: string
  ownerEmail: string
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open(): void }
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void
  prefill?: { name: string; email: string }
  theme?: { color: string }
}

export default function RazorpayButton({ service, ownerName, ownerEmail }: Props) {
  const [loading, setLoading] = useState(false)

  const loadScript = () =>
    new Promise<void>((resolve) => {
      if (document.getElementById('razorpay-script')) { resolve(); return }
      const script = document.createElement('script')
      script.id = 'razorpay-script'
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve()
      document.body.appendChild(script)
    })

  const handlePayment = async () => {
    setLoading(true)
    await loadScript()

    // Create order
    const res = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: service.price,
        currency: service.currency,
        serviceId: service.title,
        serviceTitle: service.title,
      }),
    })
    const { orderId, amount, currency } = await res.json()

    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount,
      currency,
      name: ownerName,
      description: service.title,
      order_id: orderId,
      handler: async (response) => {
        const verify = await fetch('/api/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(response),
        })
        const data = await verify.json()
        if (data.success) {
          alert('Payment successful! We will be in touch soon.')
        }
      },
      prefill: { name: ownerName, email: ownerEmail },
      theme: { color: '#7ef0c8' },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
    setLoading(false)
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading || !service.isActive}
      className="w-full py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-[#7ef0c8] text-[#0a0a0f] hover:bg-[#5dd4aa]"
    >
      {loading ? 'Processing...' : service.ctaText || 'Book Now'}
    </button>
  )
}