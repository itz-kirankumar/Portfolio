// components/site/Flow.tsx
//
// The flowing wall — the homepage's always-moving band of everything Kiran
// builds and writes. Three lanes, all CSS-animated (no JS, no scroll
// listeners): work cards drift left, writing cards drift right, and a thin
// ticker runs underneath. Each lane's content renders twice inside a
// `width: max-content` track; animating translateX(0 → -50%) loops it
// seamlessly. Hover pauses a lane; the global prefers-reduced-motion rule in
// globals.css flattens the animation for users who ask for that.
//
// The wall is *fed*, not written: works come from the works collection (or
// its code seed), posts from the published posts collection — so new work and
// new writing appear here on the next revalidate without touching this file.

import Link from 'next/link'
import { Section, SectionHead } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'
import { KIND_LABEL, STATUS_LABEL, type Work } from '@/lib/schemas/work'

export interface FlowPost {
  title: string
  href: string
  date: string
}

/* --------------------------------------------------------------- tickers --- */

function TickerLane({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  if (!items.length) return null
  const seq = [...items, ...items]
  return (
    <div className="flow-row flow-mask overflow-hidden border-y border-rule/70 bg-ink py-2.5">
      <div
        className={cn('flow-track items-center gap-0', reverse && 'flow-track--reverse')}
        style={{ ['--flow-duration' as string]: `${Math.max(24, items.length * 4)}s` }}
      >
        {[0, 1].map((half) => (
          <ul key={half} aria-hidden={half === 1} className="flex shrink-0 items-center">
            {seq.map((item, i) => (
              <li
                key={`${half}-${i}`}
                className="flex shrink-0 items-center font-mono text-[0.68rem] uppercase tracking-[0.22em] text-paper/80"
              >
                <span className="px-4">{item}</span>
                <span aria-hidden="true" className="text-coral">✦</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- work cards --- */

const STATUS_DOT: Record<string, string> = {
  live: 'bg-emerald-500',
  building: 'bg-coral',
  closed: 'bg-ink-soft/50',
}

function WorkCard({ work }: { work: Work }) {
  return (
    <Link
      href={`/work/${work.slug}`}
      className="group flex w-72 shrink-0 flex-col rounded-xl bg-card p-5 shadow-paper ring-1 ring-rule transition duration-300 hover:-translate-y-1 hover:shadow-lift sm:w-80"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft">
          {KIND_LABEL[work.kind]}
          {work.period ? ` · ${work.period}` : ''}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-ink-soft">
          <span aria-hidden="true" className={cn('size-1.5 rounded-full', STATUS_DOT[work.status])} />
          {STATUS_LABEL[work.status]}
        </span>
      </div>

      <h3 className="mt-3 font-display text-[1.15rem] font-semibold leading-snug tracking-[-0.015em] text-ink">
        {work.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-[0.86rem] leading-relaxed text-ink-soft">
        {work.tagline || work.summary}
      </p>

      <div className="mt-4 flex items-center justify-between gap-2">
        <ul className="flex min-w-0 flex-wrap gap-1.5">
          {work.tags.slice(0, 3).map((t) => (
            <li
              key={t}
              className="rounded bg-paper-deep px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-ink-soft"
            >
              {t}
            </li>
          ))}
        </ul>
        <span
          aria-hidden="true"
          className="shrink-0 text-coral-ink transition-transform duration-300 group-hover:translate-x-1"
        >
          →
        </span>
      </div>
    </Link>
  )
}

function PostCard({ post }: { post: FlowPost }) {
  return (
    <Link
      href={post.href}
      className="group flex w-72 shrink-0 flex-col rounded-xl border border-rule bg-paper p-5 transition duration-300 hover:-translate-y-1 hover:border-coral-ink/40 sm:w-80"
    >
      <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-coral-ink">
        writing{post.date ? ` · ${post.date}` : ''}
      </span>
      <h3 className="mt-3 line-clamp-3 flex-1 font-display text-[1.05rem] font-semibold leading-snug tracking-[-0.01em] text-ink">
        {post.title}
      </h3>
      <span className="mt-4 inline-flex items-center gap-1.5 text-[0.82rem] font-medium text-coral-ink">
        read it
        <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  )
}

/* ------------------------------------------------------------------ lane --- */

function Lane({
  children,
  count,
  reverse = false,
  label,
}: {
  children: React.ReactNode
  count: number
  reverse?: boolean
  label: string
}) {
  return (
    <div className="flow-row flow-mask overflow-hidden" aria-label={label}>
      <div
        className={cn('flow-track', reverse && 'flow-track--reverse')}
        style={{ ['--flow-duration' as string]: `${Math.max(30, count * 7)}s` }}
      >
        {[0, 1].map((half) => (
          <ul key={half} aria-hidden={half === 1} className="flex shrink-0 gap-4 pr-4">
            {children}
          </ul>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ wall --- */

export function FlowWall({
  works,
  posts,
  tickItems,
}: {
  works: Work[]
  posts: FlowPost[]
  tickItems: string[]
}) {
  if (!works.length && !posts.length) return null

  return (
    <div id="wall" className="bg-paper-deep">
      <Section tone="deep" compact className="!pb-10">
        <SectionHead
          eyebrow="the wall"
          heading="Everything I build and write, *always in motion*"
          intro="Projects, ventures, tools and essays — new writing flows in as it publishes, new works join as they ship. Hover a lane to slow it down; open any card for the full story."
        />
        <p className="mt-6">
          <Link
            href="/work"
            className="link-underline inline-flex items-center gap-1.5 text-[0.9rem] font-medium text-coral-ink"
          >
            Browse all works <span aria-hidden="true">→</span>
          </Link>
        </p>
      </Section>

      <div className="space-y-4 pb-14 sm:pb-20">
        {works.length ? (
          <Lane count={works.length} label="Works — projects, ventures and tools">
            {works.map((w) => (
              <li key={w.id} className="list-none">
                <WorkCard work={w} />
              </li>
            ))}
          </Lane>
        ) : null}

        {posts.length ? (
          <Lane count={posts.length} reverse label="Latest writing">
            {posts.map((p) => (
              <li key={p.href} className="list-none">
                <PostCard post={p} />
              </li>
            ))}
          </Lane>
        ) : null}
      </div>

      <TickerLane items={tickItems} />
    </div>
  )
}
