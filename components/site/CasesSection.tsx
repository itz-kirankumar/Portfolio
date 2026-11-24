import Link from 'next/link'
import { CASE_GROUPS, type CaseFile } from '@/lib/cases'
import { Section, SectionHead } from '@/components/ui/primitives'

export function CasesSection({ cases }: { cases: CaseFile[] }) {
  const items = CASE_GROUPS.map((g) => {
    const files = g.docs.map((d) => cases.find((c) => c.slug === d.slug)).filter(Boolean) as CaseFile[]
    return { g, files }
  }).filter((x) => x.files.length > 0)
  if (items.length === 0) return null
  return (
    <Section id="cases" tone="deep" compact>
      <SectionHead eyebrow="Cases" heading="Cases I worked" intro="Real case work, readable right here. View only." />
      <ul className="mt-10 grid gap-6 sm:grid-cols-2">
        {items.map(({ g, files }) => (
          <li key={g.slug} className="overflow-hidden rounded-xl border border-rule bg-card">
            <div className="relative w-full bg-paper-deep" style={{ aspectRatio: '16 / 9' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/cases/${files[0].slug}/1?v=${files[0].version}`} alt="" draggable={false} loading="lazy" className="absolute inset-0 h-full w-full select-none object-cover object-top" />
            </div>
            <div className="p-5">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-coral-ink">{g.kicker}</p>
              <h3 className="mt-2 font-display text-xl text-ink">{g.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{g.summary}</p>
              <p className="mt-3 font-mono text-xs text-ink-soft">{files.map((f) => `${f.kind === 'deck' ? 'Deck' : 'Case brief'} (${f.pages}p)`).join(' + ')}</p>
              <Link href={`/cases/${g.slug}`} className="mt-5 inline-flex rounded-full bg-coral px-5 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-white transition hover:opacity-90">View case</Link>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}
