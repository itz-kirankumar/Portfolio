// components/site/WorkCover.tsx
//
// A work's thumbnail. With a coverUrl we show the real image (a genuine
// capture of the live product or the repository's own OpenGraph card).
// Without one we render a typographic tile — the work's initial on a dark
// plate — never a fabricated product screenshot.

import { cn } from '@/lib/utils'
import type { Work } from '@/lib/schemas/work'

export function WorkCover({ work, className }: { work: Work; className?: string }) {
  if (work.coverUrl) {
    // GitHub's OpenGraph cards carry the full repo identity; cropping them
    // (object-cover) cuts the project name, so show the whole card.
    const isRepoCard = work.coverUrl.includes('opengraph.githubassets.com')
    const isWorkflowCanvas = work.coverUrl.startsWith('/works/n8n/')
    return (
      <div className={cn('overflow-hidden', isRepoCard ? 'bg-[#121212]' : 'bg-paper-deep', className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={work.coverUrl}
          alt={`${work.title} preview`}
          loading="lazy"
          className={cn(
            'size-full transition-transform duration-500 group-hover:scale-[1.03]',
            // GitHub's OpenGraph card is white-on-light; invert it into the
            // site's dark palette (hue-rotate keeps the accent colours true)
            // instead of dimming a white rectangle.
            isRepoCard ? 'object-contain [filter:invert(0.93)_hue-rotate(180deg)_saturate(0.85)]' : isWorkflowCanvas ? 'object-contain' : 'object-cover'
          )}
        />
      </div>
    )
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-card to-paper-deep',
        className
      )}
    >
      <span className="absolute inset-x-6 top-5 h-px bg-rule/70" />
      <span className="font-display text-5xl font-bold tracking-tight text-coral/80">
        {work.title.charAt(0).toUpperCase()}
      </span>
      <span className="absolute inset-x-6 bottom-5 flex items-center justify-between font-mono text-[0.58rem] uppercase tracking-[0.2em] text-ink-soft/70">
        <span>{work.kind}</span>
        <span>{work.period}</span>
      </span>
    </div>
  )
}
