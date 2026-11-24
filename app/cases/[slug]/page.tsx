// app/cases/[slug]/page.tsx: one case, one detail page, with a view-only switcher between its documents.

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getCachedSiteContent } from '@/lib/site'
import { CASE_GROUPS, getCaseGroupDocs } from '@/lib/cases'
import { SiteNav, SiteFooter } from '@/components/site/Chrome'
import { getTickItems } from '@/lib/ticker'
import { Section, SectionHead } from '@/components/ui/primitives'
import { CaseTabs } from '@/components/site/CaseTabs'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const g = CASE_GROUPS.find((x) => x.slug === slug)
  if (!g) return { title: 'Case not found' }
  return { title: `${g.title} - Cases I worked`, description: g.summary.slice(0, 200), robots: { index: false } }
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const g = CASE_GROUPS.find((x) => x.slug === slug)
  if (!g) {
    // Old per-file URLs go to the case they belong to.
    const parent = CASE_GROUPS.find((x) => x.docs.some((d) => d.slug === slug))
    if (parent) redirect(`/cases/${parent.slug}`)
    notFound()
  }
  const [content, docs, tickItems] = await Promise.all([getCachedSiteContent(), getCaseGroupDocs(g), getTickItems()])
  if (docs.length === 0) notFound()
  const { meta } = content
  return (
    <>
      <SiteNav nav={content.nav} resumeUrl={meta.resumeUrl} tickItems={tickItems} />
      <main>
        <Section compact>
          <Link href="/#cases" className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft hover:text-coral-ink">← Cases I worked</Link>
          <SectionHead className="mt-6" eyebrow={g.kicker} heading={g.title} intro={g.summary} />
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-coral-ink">The question</h2>
              <p className="mt-3 font-display text-xl text-ink">{g.question}</p>
              <h2 className="mt-8 font-mono text-xs uppercase tracking-[0.18em] text-coral-ink">What the case asked for</h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink-soft">
                {g.steps.map((s) => <li key={s}>{s}</li>)}
              </ol>
            </div>
            <dl className="space-y-3 rounded-xl border border-rule bg-card p-5 text-sm">
              {g.facts.map((f) => (
                <div key={f.label} className="grid grid-cols-[6.5rem_1fr] gap-3">
                  <dt className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft">{f.label}</dt>
                  <dd className="text-ink">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mt-14">
            <CaseTabs docs={docs.map((d) => ({ slug: d.slug, tab: d.tab, title: d.file.title, pages: d.file.pages, aspect: d.file.aspect, version: d.file.version, versionLabel: d.file.versionLabel }))} />
          </div>
        </Section>
      </main>
      <SiteFooter footer={content.footer} meta={meta} />
    </>
  )
}
