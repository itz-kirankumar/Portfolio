'use client'
// components/blocks/ServiceBlock.tsx
import type { ServiceContent } from '@/types'
import RazorpayButton from '@/components/payment/RazorpayButton'
import { Check } from 'lucide-react'

interface Props {
  content: ServiceContent
  ownerName: string
  ownerEmail: string
}

export default function ServiceBlock({ content, ownerName, ownerEmail }: Props) {
  const { title, description, price, currency, duration, features, isActive } = content
  if (!title) return null

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    maximumFractionDigits: 0,
  }).format(price)

  return (
    <div className="bg-[#13131a] border border-white/[0.07] rounded-2xl p-7 space-y-5 relative overflow-hidden">
      {/* Accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7ef0c8] to-[#818cf8]" />

      <div>
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="font-syne font-bold text-white text-xl">{title}</h3>
          {!isActive && (
            <span className="text-xs bg-white/5 text-white/30 px-2.5 py-1 rounded-full">Unavailable</span>
          )}
        </div>
        {description && <p className="text-white/50 text-sm leading-relaxed">{description}</p>}
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="font-syne font-black text-3xl text-white">{formatted}</span>
        {duration && <span className="text-white/40 text-sm">/ {duration}</span>}
      </div>

      {/* Features */}
      {features?.length > 0 && (
        <ul className="space-y-2">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm text-white/60">
              <Check size={14} className="text-[#7ef0c8] flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      )}

      {/* CTA */}
      {content.calendlyUrl ? (
        <a
          href={content.calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-3 px-6 rounded-xl font-medium text-sm bg-[#7ef0c8] text-[#0a0a0f] hover:bg-[#5dd4aa] transition-colors"
        >
          {content.ctaText || 'Book Now'}
        </a>
      ) : (
        <RazorpayButton service={content} ownerName={ownerName} ownerEmail={ownerEmail} />
      )}
    </div>
  )
}