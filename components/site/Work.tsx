// components/site/Work.tsx

import {
  Eyebrow,
  RuleDivider,
  Section,
  SectionHead,
} from '@/components/ui/primitives'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/lib/utils'
import type {
  AudiencesContent,
  ProjectsContent,
  VenturesContent,
  WaysContent,
} from '@/types/site'

/* ------------------------------------------------------------- Audiences --- */

export function Audiences({ audiences }: { audiences: AudiencesContent }) {
  if (!audiences.items.length) return null

  return (
    <Section id="audiences" tone="deep">
      <SectionHead
        eyebrow={audiences.eyebrow}
        heading={audiences.heading}
        intro={audiences.intro}
      />

      <ul className="mt-12 grid gap-5 sm:grid-cols-2">
        {audiences.items.map((a, i) => (
          <Reveal as="li" kind="up" delay={i * 70} key={a.key || a.title} className="h-full">
            <article className="flex h-full flex-col rounded-lg bg-card p-6 shadow-paper ring-1 ring-rule transition-shadow duration-300 hover:shadow-lift sm:p-7">
              <h3 className="font-display text-xl font-semibold tracking-[-0.015em] text-ink">
                {a.title}
              </h3>

              <p className="mt-3 text-[0.92rem] leading-relaxed text-ink-soft">
                <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-coral-ink">
                  you bring
                </span>
                <br />
                {a.bring}
              </p>

              {a.outcomes.length ? (
                <>
                  <p className="mt-5 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-coral-ink">
                    you leave with
                  </p>
                  <ul className="mt-2 space-y-2">
                    {a.outcomes.map((o) => (
                      <li key={o} className="flex gap-2.5 text-[0.92rem] leading-relaxed text-ink">
                        <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-coral" />
                        {o}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              {a.cta.label ? (
                <a
                  href={a.cta.href}
                  className="link-underline mt-6 inline-flex items-center gap-1.5 self-start text-[0.88rem] font-medium text-coral-ink"
                >
                  {a.cta.label}
                  <span aria-hidden="true">→</span>
                </a>
              ) : null}
            </article>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}

/* ------------------------------------------------------------------ Ways --- */

export function Ways({ ways }: { ways: WaysContent }) {
  if (!ways.items.length) return null

  return (
    <Section id="how-i-work" tone="paper">
      <SectionHead eyebrow={ways.eyebrow} heading={ways.heading} />

      <ol className="mt-12 grid gap-px overflow-hidden rounded-lg bg-rule ring-1 ring-rule md:grid-cols-3">
        {ways.items.map((w, i) => (
          <Reveal as="li" kind="up" delay={i * 80} key={w.number + w.title} className="bg-card">
            <div className="flex h-full flex-col p-7 lg:p-8">
              <p className="font-mono text-[0.9rem] font-medium tracking-[0.1em] text-coral-ink">
                {w.number}
                <span aria-hidden="true" className="mx-2 text-rule">
                  —
                </span>
                <span className="uppercase tracking-[0.16em] text-ink-soft">{w.title}</span>
              </p>

              <p className="mt-5 text-[0.95rem] leading-relaxed text-ink">{w.body}</p>

              {w.bullets.length ? (
                <ul className="mt-6 space-y-1.5 border-t border-rule pt-5">
                  {w.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex gap-2 text-[0.85rem] leading-snug text-ink-soft"
                    >
                      <span aria-hidden="true" className="text-coral">
                        ·
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </Reveal>
        ))}
      </ol>

      {ways.worked.length ? (
        <div className="mt-14">
          <RuleDivider className="mb-8" />
          <Eyebrow className="mb-6">{ways.workedLabel}</Eyebrow>
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-4">
            {ways.worked.map((org) => (
              <li key={org.name} className="flex items-baseline gap-2">
                <span className="font-display text-[1.05rem] font-medium tracking-[-0.01em] text-ink">
                  {org.name}
                </span>
                <span className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-ink-soft/80">
                  {org.note}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Section>
  )
}

/* -------------------------------------------------------------- Ventures --- */

const STATUS_STYLE: Record<string, string> = {
  live: 'bg-coral-soft text-coral-ink',
  building: 'bg-coral-soft text-coral-ink',
  closed: 'bg-paper-deep text-ink-soft',
}

const STATUS_LABEL: Record<string, string> = {
  live: 'live',
  building: 'building now',
  closed: 'wound down',
}

export function Ventures({ ventures }: { ventures: VenturesContent }) {
  if (!ventures.items.length) return null

  return (
    <Section id="ventures" tone="deep">
      <SectionHead
        eyebrow={ventures.eyebrow}
        heading={ventures.heading}
        intro={ventures.intro}
      />

      <div className="mt-12 space-y-6">
        {ventures.items.map((v, i) => (
          <Reveal kind="up" delay={i * 90} key={v.name}>
            <article className="rounded-lg bg-card p-6 shadow-paper ring-1 ring-rule sm:p-8 lg:p-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
                {/* left: identity */}
                <div className="lg:w-[17rem] lg:shrink-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
                      {v.url ? (
                        <a
                          href={v.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-underline"
                        >
                          {v.name}
                        </a>
                      ) : (
                        v.name
                      )}
                    </h3>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em]',
                        STATUS_STYLE[v.status] ?? STATUS_STYLE.closed
                      )}
                    >
                      {STATUS_LABEL[v.status] ?? v.status}
                    </span>
                  </div>

                  <p className="mt-3 text-[0.92rem] font-medium text-ink">{v.role}</p>
                  <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink-soft">
                    {v.period}
                    {v.place ? ` · ${v.place}` : ''}
                  </p>

                  {v.tags.length ? (
                    <ul className="mt-5 flex flex-wrap gap-1.5">
                      {v.tags.map((t) => (
                        <li
                          key={t}
                          className="rounded bg-paper-deep px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink-soft"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                {/* right: substance */}
                <div className="min-w-0 flex-1">
                  <p className="text-[1rem] leading-relaxed text-ink">{v.summary}</p>

                  {v.outcomes.length ? (
                    <ul className="mt-5 space-y-2.5 border-t border-rule pt-5">
                      {v.outcomes.map((o) => (
                        <li
                          key={o}
                          className="flex gap-3 text-[0.93rem] leading-relaxed text-ink-soft"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2 h-px w-3 shrink-0 bg-coral"
                          />
                          {o}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {v.metrics.length ? (
                    <dl className="mt-7 grid grid-cols-2 gap-4 border-t border-rule pt-6 sm:grid-cols-4">
                      {v.metrics.map((m) => (
                        <div key={m.label}>
                          <dt className="sr-only">{m.label}</dt>
                          <dd>
                            <span className="block font-display text-xl font-semibold leading-none tracking-[-0.02em] text-coral-ink tabular-nums">
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
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

/* -------------------------------------------------------------- Projects --- */

export function Projects({ projects }: { projects: ProjectsContent }) {
  if (!projects.items.length) return null

  return (
    <Section id="projects" tone="paper">
      <SectionHead eyebrow={projects.eyebrow} heading={projects.heading} />

      <ul className="mt-12 grid gap-5 sm:grid-cols-2">
        {projects.items.map((p, i) => (
          <Reveal as="li" kind="up" delay={i * 70} key={p.title} className="h-full">
            <article className="flex h-full flex-col rounded-lg bg-card p-6 shadow-paper ring-1 ring-rule sm:p-7">
              <p className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-ink-soft">
                {p.kind}
                {p.period ? ` · ${p.period}` : ''}
              </p>

              <h3 className="mt-3 font-display text-lg font-semibold leading-snug tracking-[-0.015em] text-ink">
                {p.title}
              </h3>

              <p className="mt-3 flex-1 text-[0.92rem] leading-relaxed text-ink-soft">{p.body}</p>

              {p.highlights.length ? (
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {p.highlights.map((h) => (
                    <li
                      key={h}
                      className="rounded bg-paper-deep px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink-soft"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
              ) : null}

              {p.badge ? (
                <p className="mt-5 border-t border-rule pt-4 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-coral-ink">
                  ★ {p.badge}
                </p>
              ) : null}
            </article>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}
