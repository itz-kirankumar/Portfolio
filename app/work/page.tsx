// app/work/page.tsx
//
// The works index — every showcased work in one grid. Same caching contract
// as the homepage: ISR with an hourly revalidate, busted immediately when a
// work is saved from the admin.

import type { Metadata } from 'next'
import Link from 'next/link'
import { getCachedSiteContent } from '@/lib/site'
import { getWorks } from '@/lib/works'
import { UtilityBar, SiteNav, SiteFooter } from '@/components/site/Chrome'
import { Section, SectionHead } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'
import { KIND_LABEL, STATUS_LABEL } from '@/lib/schemas/work'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Works',
  description: 'Products, ventures, tools and experiments — each with its own story, live link and source where public.',
}

const STATUS_DOT: Record<string, string> = {
  live: 'bg-emerald-500',
  building: 'bg-coral',
  closed: 'bg-ink-soft/50',
}

export default async function WorkIndexPage() {
  const [content, works] = await Promise.all([getCachedSiteContent(), getWorks()])
  const { meta } = content

  return (
    <>
      <UtilityBar utility={content.utility} />
      <SiteNav nav={content.nav} resumeUrl={meta.resumeUrl} />

      <main>
        <Section tone="paper" compact>
          <SectionHead
            eyebrow="all works"
            heading="Things I've built, *one story each*"
            intro="Products, ventures, tools and experiments. Open any card for the detail — what it does, why it exists, and where to see it live or read the source."
          />

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {works.map((w) => (
              <li key={w.id} className="h-full">
                <Link
                  href={`/work/${w.slug}`}
                  className="group flex h-full flex-col rounded-xl bg-card p-6 shadow-paper ring-1 ring-rule transition duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft">
                      {KIND_LABEL[w.kind]}
                      {w.period ? ` · ${w.period}` : ''}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-ink-soft">
                      <span aria-hidden="true" className={cn('size-1.5 rounded-full', STATUS_DOT[w.status])} />
                      {STATUS_LABEL[w.status]}
                    </span>
                  </div>

                  <h2 className="mt-3 font-display text-[1.3rem] font-semibold leading-snug tracking-[-0.015em] text-ink">
                    {w.title}
                  </h2>
                  <p className="mt-2 flex-1 text-[0.9rem] leading-relaxed text-ink-soft">{w.summary}</p>

                  {w.metrics.length ? (
                    <dl className="mt-5 flex gap-5 border-t border-rule pt-4">
                      {w.metrics.slice(0, 3).map((m) => (
                        <div key={m.label}>
                          <dt className="sr-only">{m.label}</dt>
                          <dd>
                            <span className="block font-display text-lg font-semibold leading-none text-coral-ink tabular-nums">
                              {m.value}
                            </span>
                            <span className="mt-1 block font-mono text-[0.6rem] uppercase tracking-[0.12em] text-ink-soft">
                              {m.label}
                            </span>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}

                  <span className="mt-5 inline-flex items-center gap-1.5 border-t border-rule pt-4 text-[0.85rem] font-medium text-coral-ink">
                    the full story
                    <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      </main>

      <SiteFooter footer={content.footer} meta={meta} />
    </>
  )
}
