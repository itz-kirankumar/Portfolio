'use client'
// components/blocks/DividerBlock.tsx
import type { DividerContent } from '@/types'

export default function DividerBlock({ content }: { content: DividerContent }) {
  const { style, height = 40 } = content

  if (style === 'space') {
    return <div style={{ height }} />
  }
  if (style === 'dots') {
    return (
      <div className="flex justify-center gap-2 py-4" style={{ paddingTop: height / 4, paddingBottom: height / 4 }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20" />
        ))}
      </div>
    )
  }
  if (style === 'wave') {
    return (
      <div className="py-4 flex justify-center opacity-20">
        <svg viewBox="0 0 200 20" width="200" height="20" fill="none">
          <path d="M0 10 C 25 0, 50 20, 75 10 S 150 0, 175 10 S 200 20, 200 10" stroke="#7ef0c8" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
    )
  }

  // Default: line
  return (
    <div style={{ paddingTop: height / 2, paddingBottom: height / 2 }}>
      <div className="h-px bg-white/[0.07]" />
    </div>
  )
}