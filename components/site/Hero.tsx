// components/site/Hero.tsx

import { Button, CredPill, Eyebrow, Highlight, Polaroid, StickyNote } from '@/components/ui/primitives'
import Reveal from '@/components/ui/Reveal'
import type { CredsContent, HeroContent, Meta, ProofContent } from '@/types/site'

/* ------------------------------------------------------------------ Hero --- */

export function Hero({ hero, meta, layout = 'stacked' }: { hero: HeroContent; meta: Meta; layout?: 'stacked' | 'split' | 'portrait-left' }) {
  
  // Layout logic
  const isStacked = layout === 'stacked'
  const isPortraitLeft = layout === 'portrait-left'
  
  const gridClass = isStacked 
    ? "gutter flex flex-col items-center text-center gap-12 pb-16 pt-14 sm:pb-24 sm:pt-20 lg:gap-16 lg:pb-32 lg:pt-24"
    : isPortraitLeft
      ? "gutter grid items-center gap-12 pb-16 pt-14 sm:pb-24 sm:pt-20 lg:grid-cols-[0.85fr_1.25fr] lg:gap-16 lg:pb-32 lg:pt-24"
      : "gutter grid items-center gap-12 pb-16 pt-14 sm:pb-24 sm:pt-20 lg:grid-cols-[1.25fr_0.85fr] lg:gap-16 lg:pb-32 lg:pt-24"

  const textClass = isStacked ? "flex flex-col items-center" : ""
  
  const textContent = (
    <div className={textClass}>
      <Reveal kind="fade">
        <Eyebrow className="mb-6">{hero.eyebrow}</Eyebrow>
      </Reveal>

      <Reveal kind="up" delay={60}>
        <h1 className={`font-display text-balance-tight text-[clamp(2.6rem,7.6vw,5.25rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-ink ${isStacked ? 'mx-auto' : ''}`}>
          {hero.headlineBefore}{' '}
          {hero.headlineHighlight ? (
            <Highlight>{hero.headlineHighlight}</Highlight>
          ) : null}
          {hero.headlineAfter}
        </h1>
      </Reveal>

      <Reveal kind="up" delay={120}>
        <p className={`mt-7 max-w-xl text-[1.06rem] leading-[1.65] text-ink-soft sm:text-[1.12rem] ${isStacked ? 'mx-auto' : ''}`}>
          {hero.subhead}
        </p>
      </Reveal>

      <Reveal kind="up" delay={180}>
        <div className={`mt-9 flex flex-wrap items-center gap-3 ${isStacked ? 'justify-center' : ''}`}>
          <Button href={hero.primaryCta.href} variant="solid" size="lg">
            {hero.primaryCta.label}
          </Button>
          <Button href={hero.secondaryCta.href} variant="outline" size="lg">
            {hero.secondaryCta.label}
          </Button>
          {meta.resumeUrl ? (
            <Button href={meta.resumeUrl} variant="ghost" size="lg" external>
              Résumé ↓
            </Button>
          ) : null}
        </div>
      </Reveal>

      <Reveal kind="fade" delay={260}>
        <p className={`mt-10 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-ink-soft/80 ${isStacked ? 'justify-center' : ''}`}>
          <span>{meta.location}</span>
          <span aria-hidden="true" className="text-coral">
            /
          </span>
          <a href={`mailto:${meta.email}`} className="link-underline hover:text-ink">
            {meta.email}
          </a>
        </p>
      </Reveal>
    </div>
  )

  const mediaContent = (
    <Reveal kind="zoom" delay={140} className="relative mx-auto w-full max-w-[22rem] lg:mx-0">
      {hero.portrait.src ? (
        <Polaroid
          src={hero.portrait.src}
          alt={hero.portrait.alt || meta.name}
          caption={hero.portrait.caption}
          rotate={hero.portrait.rotate ?? -3}
          priority
          sizes="(min-width: 1024px) 22rem, (min-width: 640px) 22rem, 70vw"
        />
      ) : null}

      {hero.scribble ? (
        <StickyNote
          rotate={4}
          className="absolute -bottom-8 -left-6 z-30 max-w-[11rem] whitespace-pre-line sm:-left-10"
        >
          {hero.scribble}
        </StickyNote>
      ) : null}
    </Reveal>
  )

  return (
    <section id="top" className="paper-grain relative overflow-hidden bg-paper">
      {/* faint ruled margin line, like a legal pad */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-[7%] hidden w-px bg-coral/15 lg:block"
      />

      <div className={gridClass}>
        {isPortraitLeft && !isStacked ? mediaContent : textContent}
        {isPortraitLeft && !isStacked ? textContent : mediaContent}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------- CredPills --- */

export function CredPills({ creds }: { creds: CredsContent }) {
  if (!creds.items.length) return null

  return (
    <section className="border-y border-rule bg-paper-deep py-8">
      <div className="gutter">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
          {creds.label ? (
            <Eyebrow className="shrink-0 pt-2.5">{creds.label}</Eyebrow>
          ) : null}
          <ul className="flex flex-wrap gap-2.5">
            {creds.items.map((item, i) => (
              <Reveal as="li" kind="fade" delay={i * 45} key={item.text}>
                <CredPill text={item.text} year={item.year} />
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ ProofStrip --- */

export function ProofStrip({ proof }: { proof: ProofContent }) {
  if (!proof.metrics.length) return null

  return (
    <section id="proof" className="scroll-mt-24 bg-paper py-16 sm:py-20">
      <div className="gutter">
        {proof.heading ? (
          <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-[-0.02em] text-ink">
            {proof.heading}
          </h2>
        ) : null}

        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
          {proof.metrics.map((m, i) => (
            <Reveal kind="up" delay={i * 60} key={m.label + m.value}>
              <div className="border-t-2 border-coral/70 pt-4">
                <dt className="sr-only">{m.label}</dt>
                <dd>
                  <span className="block font-display text-[clamp(1.9rem,4vw,2.6rem)] font-semibold leading-none tracking-[-0.03em] text-ink tabular-nums">
                    {m.value}
                  </span>
                  <span className="mt-2 block text-[0.86rem] font-medium leading-snug text-ink">
                    {m.label}
                  </span>
                  {m.context ? (
                    <span className="mt-1 block text-[0.78rem] leading-snug text-ink-soft">
                      {m.context}
                    </span>
                  ) : null}
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  )
}
