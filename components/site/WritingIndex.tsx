'use client'
// components/site/WritingIndex.tsx
//
// The full writing directory: every published piece on one page. A featured
// lead (the latest), a search box and topic filter, then the whole archive
// grouped by year. All filtering is client-side over a list the server already
// fetched — the set is small, so there's no reason to round-trip.
//
// Dates are preformatted on the server (dateLabel, year) so this component
// never calls toLocaleDateString: formatting here would read the client's
// timezone and mismatch the prerendered HTML on hydration.

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type WritingIndexPost = {
  slug: string
  title: string
  excerpt: string
  coverUrl: string
  tags: string[]
  readingMinutes: number
  dateLabel: string
  year: number
}

function Meta({ post, className }: { post: WritingIndexPost; className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink-soft',
        className
      )}
    >
      {post.dateLabel ? <span>{post.dateLabel}</span> : null}
      {post.dateLabel ? <span aria-hidden="true" className="text-rule">/</span> : null}
      <span>{post.readingMinutes} min read</span>
    </div>
  )
}

function TagRow({ tags }: { tags: string[] }) {
  if (!tags.length) return null
  return (
    <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
      {tags.map((t) => (
        <li
          key={t}
          className="font-mono text-[0.68rem] lowercase tracking-[0.04em] text-coral-ink/85"
        >
          #{t}
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------- Featured --- */

function FeaturedLead({ post }: { post: WritingIndexPost }) {
  return (
    <article className="group relative">
      <Link
        href={`/writing/${post.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div
          className={cn(
            'grid items-center gap-7 lg:gap-12',
            post.coverUrl ? 'lg:grid-cols-[1.15fr_1fr]' : ''
          )}
        >
          {post.coverUrl ? (
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-paper-deep shadow-lift ring-1 ring-rule">
              <Image
                src={post.coverUrl}
                alt={post.title}
                fill
                priority
                sizes="(min-width: 1024px) 40rem, 92vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
              />
            </div>
          ) : null}

          <div className={post.coverUrl ? '' : 'max-w-2xl border-l-2 border-coral pl-6'}>
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-coral-ink">
              Latest
            </p>
            <Meta post={post} className="mt-4" />
            <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.9rem)] font-semibold leading-[1.07] tracking-[-0.02em] text-ink text-balance-tight">
              {post.title}
            </h2>
            {post.excerpt ? (
              <p className="mt-4 max-w-[46ch] text-[1.05rem] leading-relaxed text-ink-soft">
                {post.excerpt}
              </p>
            ) : null}
            <TagRow tags={post.tags} />
            <span className="mt-6 inline-flex items-center gap-1.5 font-medium text-coral-ink">
              Read the piece
              <span className="sr-only"> (opens in a new tab)</span>
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

/* ------------------------------------------------------------- list row --- */

function Row({ post }: { post: WritingIndexPost }) {
  return (
    <li>
      <Link
        href={`/writing/${post.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group grid grid-cols-1 items-start gap-x-6 gap-y-3 py-7 sm:grid-cols-[1fr_auto]"
      >
        <div className="min-w-0">
          <Meta post={post} />
          <h3 className="mt-2 font-display text-[1.35rem] font-medium leading-snug tracking-[-0.015em] text-ink">
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1.5px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 ease-out group-hover:bg-[length:100%_1.5px]">
              {post.title}
            </span>
            <span className="sr-only"> (opens in a new tab)</span>
            <span
              aria-hidden="true"
              className="ml-2 inline-block text-coral transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </h3>
          {post.excerpt ? (
            <p className="mt-2 max-w-[68ch] text-[1rem] leading-relaxed text-ink-soft line-clamp-2">
              {post.excerpt}
            </p>
          ) : null}
          <TagRow tags={post.tags} />
        </div>

        {post.coverUrl ? (
          <div className="relative hidden aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-md bg-paper-deep ring-1 ring-rule sm:block lg:w-36">
            <Image
              src={post.coverUrl}
              alt=""
              fill
              sizes="9rem"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
            />
          </div>
        ) : null}
      </Link>
    </li>
  )
}

/* --------------------------------------------------------------- index ---- */

export function WritingIndex({
  posts,
  eyebrow,
  heading,
  intro,
}: {
  posts: WritingIndexPost[]
  eyebrow: string
  heading: string
  intro: string
}) {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  // Topics ordered by how often they appear, so the busiest beats lead.
  const tags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of posts) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t)
  }, [posts])

  const q = query.trim().toLowerCase()
  const isDefault = !q && !activeTag

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (activeTag && !p.tags.includes(activeTag)) return false
      if (!q) return true
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [posts, q, activeTag])

  // The featured lead only headlines the unfiltered archive; once the reader
  // is searching or filtering, every match belongs in the same honest list.
  const featured = isDefault && posts.length > 0 ? posts[0] : null
  const listPosts = featured ? filtered.filter((p) => p.slug !== featured.slug) : filtered

  const groups = useMemo(() => {
    const byYear = new Map<number, WritingIndexPost[]>()
    for (const p of listPosts) {
      const arr = byYear.get(p.year)
      if (arr) arr.push(p)
      else byYear.set(p.year, [p])
    }
    return [...byYear.entries()].sort((a, b) => b[0] - a[0])
  }, [listPosts])

  const total = posts.length
  const countLabel = isDefault
    ? `${total} ${total === 1 ? 'piece' : 'pieces'}`
    : `${filtered.length} of ${total}`

  return (
    <div>
      {/* Header */}
      <header className="max-w-2xl">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-coral-ink">{eyebrow}</p>
        <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-ink text-balance-tight">
          {heading}
        </h1>
        {intro ? <p className="mt-5 text-[1.1rem] leading-relaxed text-ink-soft">{intro}</p> : null}
      </header>

      {total > 0 ? (
        <>
          {/* Controls: search + topics */}
          <div className="mt-12 flex flex-col gap-4 border-y border-rule py-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative flex w-full items-center lg:max-w-xs">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 size-4 text-ink-soft" />
              <span className="sr-only">Search writing</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the archive…"
                className="w-full rounded-full bg-card py-2.5 pl-10 pr-9 text-[0.92rem] text-ink shadow-paper ring-1 ring-rule placeholder:text-ink-soft/70 focus:ring-coral/60"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 grid size-5 place-items-center rounded-full text-ink-soft hover:text-ink"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </label>

            {tags.length > 0 ? (
              <div
                className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:flex-wrap lg:justify-end lg:overflow-visible lg:px-0 lg:pb-0"
                role="group"
                aria-label="Filter by topic"
              >
                <TopicChip label="All" active={!activeTag} onClick={() => setActiveTag(null)} />
                {tags.map((t) => (
                  <TopicChip
                    key={t}
                    label={t}
                    active={activeTag === t}
                    onClick={() => setActiveTag(activeTag === t ? null : t)}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <p className="mt-4 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-ink-soft/80">
            {countLabel}
            {activeTag ? <span className="text-coral-ink"> · #{activeTag}</span> : null}
          </p>

          {/* Featured */}
          {featured ? (
            <div className="mt-10">
              <FeaturedLead post={featured} />
            </div>
          ) : null}

          {/* Grouped archive */}
          {groups.length > 0 ? (
            <div className={cn('space-y-14', featured ? 'mt-16 border-t border-rule pt-14' : 'mt-12')}>
              {groups.map(([year, items]) => (
                <section key={year} className="grid grid-cols-1 gap-x-8 gap-y-2 lg:grid-cols-[7rem_1fr]">
                  <h2 className="font-mono text-[0.9rem] font-medium tracking-[0.08em] text-ink-soft lg:sticky lg:top-24 lg:self-start">
                    {year}
                  </h2>
                  <ul className="divide-y divide-rule border-t border-rule">
                    {items.map((p) => (
                      <Row key={p.slug} post={p} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            <div className="mt-14 rounded-xl border border-dashed border-rule px-6 py-14 text-center">
              <p className="font-hand text-2xl leading-snug text-ink-soft">
                Nothing matches that yet.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setActiveTag(null)
                }}
                className="mt-4 inline-flex items-center gap-1.5 text-[0.9rem] font-medium text-coral-ink link-underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-14 rounded-xl border border-dashed border-rule px-6 py-14">
          <p className="font-hand text-2xl leading-snug text-ink-soft">No pieces published yet.</p>
        </div>
      )}
    </div>
  )
}

function TopicChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[0.8rem] font-medium transition-colors',
        active
          ? 'bg-coral-deep text-white shadow-paper'
          : 'bg-card text-ink-soft ring-1 ring-rule hover:text-ink hover:ring-coral/50'
      )}
    >
      {label === 'All' ? label : `#${label}`}
    </button>
  )
}
