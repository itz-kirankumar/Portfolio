'use client'
// components/blocks/MapBlock.tsx
import type { MapContent } from '@/types'
import { MapPin } from 'lucide-react'

export default function MapBlock({ content }: { content: MapContent }) {
  const { lat, lng, zoom = 13, label, address } = content
  const q = encodeURIComponent(address || label || `${lat},${lng}`)
  const src = `https://maps.google.com/maps?q=${q}&z=${zoom}&output=embed`

  return (
    <div className="space-y-3">
      {(label || address) && (
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-[#7ef0c8]" />
          <span className="text-white/70 text-sm">{label || address}</span>
        </div>
      )}
      <div className="rounded-2xl overflow-hidden border border-white/[0.07] h-80">
        <iframe
          title="map"
          src={src}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  )
}