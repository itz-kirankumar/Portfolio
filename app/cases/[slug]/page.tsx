// app/cases/[slug]/page.tsx — in-site, view-only reader for one case file.

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCachedSiteContent } from '@/lib/site'
import { getCase } from '@/lib/cases'
import { SiteNav, SiteFooter } from '@/components/site/Chrome'
import { getTickItems } from '@/lib/ticker'
import { Section, SectionHead } from '@/components/ui/primitives'
import { CaseViewer } from '@/components/site/CaseViewer'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const c = await getCase(slug)
  if (!c) return { title: 'Case not found' }
  return { title: `${c.title} - Cases I worked`, description: c.blurb.slice(0, 200), robots: { index: false } }
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [content, c, tickItems] = await Promise.all([getCachedSiteContent(), getCase(slug), getTickItems()])
  if (!c) notFound()
  const { meta } = content
  const updated = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(c.updatedAt))
  return (
    <>
      <SiteNav nav={content.nav} resumeUrl={meta.resumeUrl} tickItems={tickItems} />
      <main>
        <Section compact>
          <Link href="/#cases" className="font-mono text-xs uppercase tracking-[0.14em] text-ink-soft hover:text-coral-ink">← Cases I worked</Link>
          <SectionHead className="mt-6" eyebrow={c.kind === 'deck' ? 'Deck' : 'Case brief'} heading={c.title} intro={c.blurb} />
          <p className="mt-4 font-mono text-xs tracking-[0.1em] text-ink-soft">{c.versionLabel} · updated {updated} · view only</p>
          <div className="mt-10">
            <CaseViewer slug={c.slug} title={c.title} pages={c.pages} aspect={c.aspect} version={c.version} />
          </div>
        </Section>
      </main>
      <SiteFooter footer={content.footer} meta={meta} />
    </>
  )
}
