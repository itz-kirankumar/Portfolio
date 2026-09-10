// components/site/Voice.tsx
//
// The opinionated half of the page: the numbered framework, the before/after
// ledger, and the handwritten "why me" card. These are what make it a portfolio
// rather than a résumé in HTML.

import {
  Button,
  Eyebrow,
  NotebookCard,
  Polaroid,
  Section,
  SectionHead,
} from '@/components/ui/primitives'
import Reveal from '@/components/ui/Reveal'
import type {
  ClosingContent,
  ContrastsContent,
  GalleryContent,
  Meta,
  OneCardContent,
  PovContent,
  WritingContent,
} from '@/types/site'

/* ------------------------------------------------------------ PointOfView --- */

export function PointOfView({ pov }: { pov: PovContent }) {
  if (!pov.items.length) return null

  return (
    <Section id="point-of-view" tone="paper" className="paper-grain">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHead
            eyebrow={pov.eyebrow}
            heading={pov.heading}
            intro={pov.intro}
          />

          {pov.pullQuote ? (
            <blockquote className="mt-10 border-l-2 border-coral pl-5">
              <p className="font-hand text-[1.6rem] leading-snug text-ink">
                “{pov.pullQuote}”
              </p>
            </blockquote>
          ) : null}
        </div>

        <ol className="space-y-0">
          {pov.items.map((item, i) => (
            <Reveal as="li" kind="up" delay={i * 55} key={item.number + item.title}>
              <div className="grid grid-cols-[3.25rem_1fr] gap-x-4 border-b border-rule py-6 first:pt-0">
                <span className="pt-0.5 font-mono text-[0.95rem] font-medium tracking-[0.06em] text-coral">
                  {item.number}
                </span>
                <div>
                  <h3 className="font-display text-[1.15rem] font-semibold tracking-[-0.015em] text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{item.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  )
}

/* -------------------------------------------------------------- Contrasts --- */

export function Contrasts({ contrasts }: { contrasts: ContrastsContent }) {
  if (!contrasts.items.length) return null

  return (
    <Section tone="deep">
      <SectionHead eyebrow={contrasts.eyebrow} heading={contrasts.heading} />

      <ul className="mt-10 divide-y divide-rule border-y border-rule">
        {contrasts.items.map((c, i) => (
          <Reveal as="li" kind="fade" delay={i * 55} key={c.before}>
            <div className="grid items-center gap-2 py-5 sm:grid-cols-[1fr_auto_1fr] sm:gap-6">
              <span className="font-display text-[1.05rem] leading-snug text-ink-soft line-through decoration-coral/50 decoration-1">
                {c.before}
              </span>
              <span
                aria-hidden="true"
                className="font-mono text-coral sm:text-center"
              >
                →
              </span>
              <span className="font-display text-[1.15rem] font-medium leading-snug tracking-[-0.01em] text-ink">
                {c.after}
              </span>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}

/* ---------------------------------------------------------------- Gallery --- */

export function Gallery({ gallery }: { gallery: GalleryContent }) {
  if (!gallery.photos.length) return null

  return (
    <Section tone="paper">
      <SectionHead eyebrow={gallery.eyebrow} heading={gallery.heading} />

      <ul className="mt-14 grid grid-cols-2 gap-8 sm:gap-10 lg:grid-cols-4">
        {gallery.photos.map((photo, i) => (
          <Reveal as="li" kind="zoom" delay={i * 60} key={photo.src + i}>
            <Polaroid
              src={photo.src}
              alt={photo.alt}
              caption={photo.caption}
              rotate={photo.rotate ?? (i % 2 === 0 ? -2.5 : 2.5)}
              sizes="(min-width: 1024px) 16rem, 42vw"
            />
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}

/* ---------------------------------------------------------------- Writing --- */

export function Writing({ writing }: { writing: WritingContent }) {
  const hasPosts = writing.posts.length > 0

  return (
    <Section id="writing" tone="dark">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <SectionHead
          eyebrow={writing.eyebrow}
          heading={writing.heading}
          intro={writing.intro}
          tone="paper"
        />

        <div>
          {hasPosts ? (
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {writing.posts.map((post, i) => (
                <Reveal as="li" kind="fade" delay={i * 55} key={post.href + post.title}>
                  <a
                    href={post.href}
                    target={post.href.startsWith('http') ? '_blank' : undefined}
                    rel={post.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="group flex flex-col gap-1.5 py-5 transition-opacity hover:opacity-80"
                  >
                    {post.date ? (
                      <span className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-paper/50">
                        {post.date}
                      </span>
                    ) : null}
                    <span className="font-display text-lg font-medium leading-snug tracking-[-0.015em] text-paper">
                      {post.title}
                      <span aria-hidden="true" className="ml-2 inline-block text-coral transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                    {post.blurb ? (
                      <span className="text-[0.9rem] leading-relaxed text-paper/60">
                        {post.blurb}
                      </span>
                    ) : null}
                  </a>
                </Reveal>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed border-white/20 px-6 py-10">
              <p className="font-hand text-2xl leading-snug text-paper/80">
                Posts land here soon —
                <br />
                in the meantime, the thinking is on LinkedIn.
              </p>
            </div>
          )}

          {writing.cta.label ? (
            <Button href={writing.cta.href} variant="onDark" className="mt-8" external>
              {writing.cta.label}
              <span aria-hidden="true">→</span>
            </Button>
          ) : null}
        </div>
      </div>
    </Section>
  )
}

/* ---------------------------------------------------------------- OneCard --- */

export function OneCard({ oneCard }: { oneCard: OneCardContent }) {
  if (!oneCard.bullets.length) return null

  return (
    <Section id="about" tone="paper">
      <div className="mx-auto max-w-3xl">
        <Reveal kind="up">
          <NotebookCard>
            <h2 className="font-hand text-[2.6rem] leading-none text-ink">{oneCard.heading}</h2>

            <ul className="mt-8 space-y-5">
              {oneCard.bullets.map((b, i) => (
                <li key={b} className="grid grid-cols-[2rem_1fr] gap-x-2">
                  <span className="font-mono text-[0.8rem] leading-[1.7rem] text-coral">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-[0.98rem] leading-[1.6875rem] text-ink">{b}</p>
                </li>
              ))}
            </ul>

            {oneCard.signature ? (
              <p className="mt-10 font-hand text-[2.2rem] leading-none text-coral-ink">
                {oneCard.signature}
                <span aria-hidden="true" className="ml-1 text-ink-soft">
                  ✎
                </span>
              </p>
            ) : null}
          </NotebookCard>
        </Reveal>
      </div>
    </Section>
  )
}

/* ---------------------------------------------------------------- Closing --- */

export function Closing({ closing, meta }: { closing: ClosingContent; meta: Meta }) {
  return (
    <Section id="contact" tone="deep" className="paper-grain">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow className="mb-6 text-center">get in touch</Eyebrow>

        <h2 className="font-hand text-[clamp(3.4rem,11vw,6rem)] leading-[0.85] text-ink">
          {closing.heading}
        </h2>

        <p className="mx-auto mt-7 max-w-xl text-[1.02rem] leading-relaxed text-ink-soft">
          {closing.body}
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href={closing.primaryCta.href} variant="solid" size="lg">
            {closing.primaryCta.label}
          </Button>
          {closing.secondaryCta.label ? (
            <Button href={closing.secondaryCta.href} variant="outline" size="lg">
              {closing.secondaryCta.label}
            </Button>
          ) : null}
        </div>

        {closing.note ? (
          <p className="mt-6 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-ink-soft/80">
            {closing.note}
          </p>
        ) : null}

        {meta.linkedin ? (
          <p className="mt-10 text-[0.9rem] text-ink-soft">
            Prefer LinkedIn?{' '}
            <a
              href={meta.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline font-medium text-coral-ink"
            >
              I&rsquo;m there too
            </a>
            .
          </p>
        ) : null}
      </div>
    </Section>
  )
}
