'use client'
// components/blocks/ButtonBlock.tsx
import type { ButtonContent } from '@/types'
import { ExternalLink } from 'lucide-react'

const STYLES: Record<string, string> = {
  primary:   'bg-[#7ef0c8] text-[#0a0a0f] hover:bg-[#5dd4aa]',
  secondary: 'bg-[#818cf8] text-white hover:bg-[#6366f1]',
  outline:   'border border-[#7ef0c8] text-[#7ef0c8] hover:bg-[#7ef0c8]/10',
  ghost:     'text-white/60 hover:text-white hover:bg-white/[0.06]',
}

export default function ButtonBlock({ content }: { content: ButtonContent }) {
  if (!content.label) return null
  return (
    <a
      href={content.url || '#'}
      target={content.openInNewTab ? '_blank' : undefined}
      rel={content.openInNewTab ? 'noopener noreferrer' : undefined}
      className={`inline-flex items-center gap-2 px-7 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${STYLES[content.style || 'primary']}`}
    >
      {content.label}
      {content.openInNewTab && <ExternalLink size={13} />}
    </a>
  )
}