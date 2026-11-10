// app/work/[slug]/page.tsx
//
// One page per work — the detail a wall card links to. ISR like the article
// pages: generateStaticParams returns [] so any slug renders on demand, and
// saving a work in the admin revalidates its path.

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCachedSiteContent } from '@/lib/site'
import { getWork, getWorks } from '@/lib/works'
import { WorkCover } from '@/components/site/WorkCover'
import { SiteNav, SiteFooter } from '@/components/site/Chrome'
import { getTickItems } from '@/lib/ticker'
import { Section } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'
import { KIND_LABEL, STATUS_LABEL } from '@/lib/schemas/work'

export const revalidate = 3600

export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const work = await getWork(slug)
  if (!work) return { title: 'Work not found' }
  const { meta } = await getCachedSiteContent()
  const description = (work.summary || work.tagline).slice(0, 200)
  return {
    title: `${work.title} - Works`,
    description,
    openGraph: { title: work.title, description },
    twitter: { card: 'summary_large_image', title: work.title, description, creator: meta.twitterHandle },
  }
}

const STATUS_DOT: Record<string, string> = {
  live: 'bg-emerald-500',
  building: 'bg-coral',
  closed: 'bg-ink-soft/50',
}

export default async function WorkDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [content, work, all] = await Promise.all([getCachedSiteContent(), getWork(slug), getWorks()])
  if (!work) notFound()

  const { meta } = content
  const tickItems = await getTickItems()
  const paragraphs = work.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  const idx = all.findIndex((w) => w.id === work.id)
  const prev = idx > 0 ? all[idx - 1] : null
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null

  return (
    <>
      <SiteNav nav={content.nav} resumeUrl={meta.resumeUrl} tickItems={tickItems} />

      <main>
        <Section tone="paper" compact>
          <WorkCover work={work} className="aspect-[21/9] w-full rounded-2xl ring-1 ring-rule" />
          <div className="mt-10 max-w-3xl">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-ink-soft">
              <Link href="/work" className="text-coral-ink hover:underline">
                all works
              </Link>
              <span aria-hidden="true"> / </span>
              {KIND_LABEL[work.kind].toLowerCase()}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-balance-tight text-[clamp(2rem,5vw,3.2rem)] font-semibold leading-[1.06] tracking-[-0.02em] text-ink">
                {work.title}
              </h1>
              <span className="flex items-center gap-1.5 rounded-full bg-paper-deep px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink-soft">
                <span aria-hidden="true" className={cn('size-1.5 rounded-full', STATUS_DOT[work.status])} />
                {STATUS_LABEL[work.status]}
                {work.period ? ` · ${work.period}` : ''}
              </span>
            </div>

            {work.tagline ? (
              <p className="mt-4 font-display text-[1.25rem] leading-snug text-ink-soft">{work.tagline}</p>
            ) : null}

            {(work.liveUrl || work.sourceUrl) && (
              <div className="mt-7 flex flex-wrap gap-3">
                {work.liveUrl ? (
                  <a
                    href={work.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-coral-deep px-5 py-2.5 text-[0.9rem] font-medium text-white transition hover:bg-coral"
                  >
                    Open live <span aria-hidden="true">↗</span>
                  </a>
                ) : null}
                {work.sourceUrl ? (
                  <a
                    href={work.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-rule bg-card px-5 py-2.5 text-[0.9rem] font-medium text-ink transition hover:border-ink-soft"
                  >
                    Source code <span aria-hidden="true">↗</span>
                  </a>
                ) : null}
              </div>
            )}

            {work.metrics.length ? (
              <dl className="mt-10 grid grid-cols-2 gap-4 border-y border-rule py-6 sm:grid-cols-4">
                {work.metrics.map((m) => (
                  <div key={m.label}>
                    <dt className="sr-only">{m.label}</dt>
                    <dd>
                      <span className="block font-display text-2xl font-semibold leading-none tracking-[-0.02em] text-coral-ink tabular-nums">
                        {m.value}
                      </span>
                      <span className="mt-1.5 block font-mono text-[0.64rem] uppercase tracking-[0.12em] text-ink-soft">
                        {m.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {work.summary ? (
              <p className="mt-8 text-[1.06rem] font-medium leading-relaxed text-ink">{work.summary}</p>
            ) : null}

            {paragraphs.map((p, i) => (
              <p key={i} className="mt-5 text-[1rem] leading-relaxed text-ink-soft">
                {p}
              </p>
            ))}

            {work.highlights.length ? (
              <ul className="mt-8 space-y-2.5 border-t border-rule pt-6">
                {work.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-[0.95rem] leading-relaxed text-ink">
                    <span aria-hidden="true" className="mt-2.5 h-px w-3 shrink-0 bg-coral" />
                    {h}
                  </li>
                ))}
              </ul>
            ) : null}

            {work.gallery.length ? (
              <ul className="mt-10 space-y-6">
                {work.gallery.map((g) => (
                  <li key={g.src}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={g.src}
                      alt={g.alt}
                      loading="lazy"
                      className="w-full rounded-xl ring-1 ring-rule"
                    />
                    {g.alt ? (
                      <p className="mt-2 font-mono text-[0.64rem] uppercase tracking-[0.12em] text-ink-soft">
                        {g.alt}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}

            {work.tags.length ? (
              <ul className="mt-8 flex flex-wrap gap-1.5">
                {work.tags.map((t) => (
                  <li
                    key={t}
                    className="rounded bg-paper-deep px-2.5 py-1 font-mono text-[0.64rem] uppercase tracking-[0.1em] text-ink-soft"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <nav aria-label="More works" className="mt-16 grid gap-4 border-t border-rule pt-8 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/work/${prev.slug}`}
                className="group rounded-xl bg-card p-5 ring-1 ring-rule transition hover:shadow-lift"
              >
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft">
                  ← previous
                </span>
                <span className="mt-2 block font-display text-[1.05rem] font-semibold text-ink group-hover:text-coral-ink">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/work/${next.slug}`}
                className="group rounded-xl bg-card p-5 text-right ring-1 ring-rule transition hover:shadow-lift"
              >
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft">
                  next →
                </span>
                <span className="mt-2 block font-display text-[1.05rem] font-semibold text-ink group-hover:text-coral-ink">
                  {next.title}
                </span>
              </Link>
            ) : null}
          </nav>
        </Section>
      </main>

      <SiteFooter footer={content.footer} meta={meta} />
    </>
  )
}
