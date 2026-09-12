'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { verifyPayment } from './actions'
import { Loader2 } from 'lucide-react'

export function RazorpayClient({ 
  orderId, 
  amount, 
  currency, 
  name, 
  email, 
  contactName,
  slug,
  bookingId,
  razorpayKeyId
}: {
  orderId: string
  amount: number
  currency: string
  name: string
  email: string
  contactName: string
  slug: string
  bookingId: string
  razorpayKeyId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId || !razorpayKeyId) {
      setError('Missing payment configuration')
      setLoading(false)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => {
      const options = {
        key: razorpayKeyId,
        amount: amount.toString(),
        currency: currency,
        name: name,
        description: `Booking for ${name}`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            setLoading(true)
            await verifyPayment(
              bookingId,
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            )
            router.push(`/services/${slug}/book/success`)
          } catch (err: any) {
            setError(err.message || 'Payment verification failed')
            setLoading(false)
          }
        },
        prefill: {
          name: contactName,
          email: email,
        },
        theme: {
          color: '#ff6b4a',
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
            setError('Payment cancelled. Please try again.')
          }
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        setError(response.error.description || 'Payment failed')
        setLoading(false)
      })
      rzp.open()
    }
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [orderId, razorpayKeyId, amount, currency, name, email, contactName, slug, bookingId, router])

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-coral-ink mb-6 font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-paper transition hover:bg-ink/80"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-ink-soft">
      <Loader2 className="size-8 animate-spin mb-4" />
      <p className="font-medium animate-pulse">Waiting for payment...</p>
    </div>
  )
}