import Link from 'next/link'
import type { CaseFile } from '@/lib/cases'
import { Section, SectionHead } from '@/components/ui/primitives'

export function CasesSection({ cases }: { cases: CaseFile[] }) {
  if (cases.length === 0) return null
  return (
    <Section id="cases" tone="deep" compact>
      <SectionHead eyebrow="Cases" heading="Cases I worked" intro="Real case work, readable right here. View only." />
      <ul className="mt-10 grid gap-6 sm:grid-cols-2">
        {cases.map((c) => (
          <li key={c.slug}>
            <Link href={`/cases/${c.slug}`} className="group block overflow-hidden rounded-xl border border-rule bg-card transition hover:border-coral">
              <div className="relative w-full bg-paper-deep" style={{ aspectRatio: '16 / 10' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/api/cases/${c.slug}/1?v=${c.version}`} alt="" draggable={false} loading="lazy" className="absolute inset-0 h-full w-full select-none object-cover object-top" />
              </div>
              <div className="p-5">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-coral-ink">{c.kind === 'deck' ? 'Deck' : 'Case brief'} · {c.pages} pages</p>
                <h3 className="mt-2 font-display text-xl text-ink">{c.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{c.blurb}</p>
                <p className="mt-3 font-mono text-xs text-ink-soft">{c.versionLabel}</p>
                <span className="mt-4 inline-block font-mono text-xs uppercase tracking-[0.14em] text-ink group-hover:text-coral-ink">Read in viewer →</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}
