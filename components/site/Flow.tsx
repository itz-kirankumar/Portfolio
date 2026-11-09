// components/site/Flow.tsx
//
// The flowing wall — the homepage's always-moving band of everything Kiran
// builds and writes. Two lanes, all CSS-animated (no JS, no scroll
// listeners): work cards drift left, writing cards drift right. Each lane's
// content renders twice inside a `width: max-content` track; animating
// translateX(0 → -50%) loops it seamlessly. Hover or keyboard focus pauses a
// lane; the global prefers-reduced-motion rule flattens the animation.
//
// The wall is *fed*, not written: works come from the works collection (or
// its code seed) plus automatic public-GitHub ingestion, posts from the
// published posts collection — so new work and new writing appear here on
// the next revalidate without touching this file.

import Link from 'next/link'
import { Section, SectionHead } from '@/components/ui/primitives'
import { WorkCover } from '@/components/site/WorkCover'
import { cn } from '@/lib/utils'
import { KIND_LABEL, STATUS_LABEL, type Work } from '@/lib/schemas/work'

export interface FlowPost {
  title: string
  href: string
  date: string
  coverUrl?: string
}

/* ------------------------------------------------------------- work cards --- */

const STATUS_DOT: Record<string, string> = {
  live: 'bg-emerald-500',
  building: 'bg-coral',
  closed: 'bg-ink-soft/50',
  repository: 'bg-ink-soft/50',
}

function WorkCard({ work }: { work: Work }) {
  return (
    <Link
      href={`/work/${work.slug}`}
      className="group flex w-72 shrink-0 flex-col overflow-hidden rounded-xl bg-card shadow-paper ring-1 ring-rule transition duration-300 hover:-translate-y-1 hover:-rotate-1 hover:shadow-lift hover:ring-coral/50 sm:w-80"
    >
      <WorkCover work={work} className="aspect-[16/10] w-full" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft">
            {KIND_LABEL[work.kind]}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-ink-soft">
            <span aria-hidden="true" className={cn('size-1.5 rounded-full', STATUS_DOT[work.status])} />
            {STATUS_LABEL[work.status]}
          </span>
        </div>

        <h3 className="mt-2.5 font-display text-[1.15rem] font-semibold leading-snug tracking-[-0.015em] text-ink">
          {work.title}
        </h3>
        <p className="mt-1 line-clamp-2 flex-1 text-[0.86rem] leading-relaxed text-ink-soft">
          {work.tagline || work.summary}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink-soft/80">
            {work.period}
          </span>
          <span
            aria-hidden="true"
            className="shrink-0 text-coral-ink transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  )
}

function PostCard({ post }: { post: FlowPost }) {
  return (
    <Link
      href={post.href}
      className="group flex w-72 shrink-0 flex-col overflow-hidden rounded-xl border border-rule bg-paper transition duration-300 hover:-translate-y-1 hover:rotate-1 hover:border-coral-ink/40 sm:w-80"
    >
      {post.coverUrl ? (
        <div className="aspect-[16/9] w-full overflow-hidden bg-paper-deep">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverUrl}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-coral-ink">
          writing{post.date ? ` · ${post.date}` : ''}
        </span>
        <h3 className="mt-2.5 line-clamp-3 flex-1 font-display text-[1.05rem] font-semibold leading-snug tracking-[-0.01em] text-ink">
          {post.title}
        </h3>
        <span className="mt-4 inline-flex items-center gap-1.5 text-[0.82rem] font-medium text-coral-ink">
          read it
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
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
    <div className="flow-row flow-mask overflow-hidden mr-[4.5rem] sm:mr-24" aria-label={label}>
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
}: {
  works: Work[]
  posts: FlowPost[]
}) {
  if (!works.length && !posts.length) return null

  return (
    <div id="wall" className="bg-paper-deep">
      <Section tone="deep" compact className="!pb-10">
        <SectionHead
          eyebrow="the wall"
          heading="Everything I build and write, *always in motion*"
          intro="Projects, ventures, tools and essays. New writing flows in as it publishes, new works join as they ship. Hover a lane to slow it down; open any card for the full story."
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
        {/* lanes keep the bottom-right lane clear of the floating chat button */}
        {works.length ? (
          <Lane count={works.length} label="Works: projects, ventures and tools">
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
    </div>
  )
}
