'use client'
// components/blocks/SocialBlock.tsx
import type { SocialContent } from '@/types'

const PLATFORM_COLORS: Record<string, string> = {
  twitter:   '#1DA1F2',
  github:    '#fff',
  linkedin:  '#0077b5',
  instagram: '#E1306C',
  youtube:   '#FF0000',
  website:   '#7ef0c8',
  email:     '#7ef0c8',
  default:   '#7ef0c8',
}

export default function SocialBlock({ content }: { content: SocialContent }) {
  const { links, displayStyle } = content
  if (!links?.length) return null

  if (displayStyle === 'icons') {
    return (
      <div className="flex gap-3 flex-wrap">
        {links.map((l, i) => {
          const color = PLATFORM_COLORS[l.platform.toLowerCase()] || PLATFORM_COLORS.default
          return (
            <a
              key={i}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              title={l.platform}
              className="w-11 h-11 rounded-xl border border-white/[0.08] bg-[#13131a] flex items-center justify-center text-lg hover:border-white/20 transition-all"
              style={{ color }}
            >
              {l.icon || l.platform.charAt(0).toUpperCase()}
            </a>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {links.map((l, i) => {
        const color = PLATFORM_COLORS[l.platform.toLowerCase()] || PLATFORM_COLORS.default
        return (
          <a
            key={i}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-[#13131a] border border-white/[0.07] rounded-xl hover:border-white/[0.15] transition-all group"
          >
            <span className="text-lg">{l.icon || '🔗'}</span>
            <span className="text-white/60 text-sm group-hover:text-white transition-colors">{l.platform}</span>
            <span className="ml-auto text-xs" style={{ color }}>{new URL(l.url).hostname}</span>
          </a>
        )
      })}
    </div>
  )
}