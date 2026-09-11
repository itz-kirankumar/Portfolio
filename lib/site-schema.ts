// lib/site-schema.ts
//
// Zod v4 (^4.3.6) — note `z.record` takes (key, value) here, and custom messages
// use `error`, not `message`. Every field added after schemaVersion 1 must carry
// a `.default(...)` so older stored documents keep parsing.

import { z } from 'zod'
import type { SectionKey } from '@/types/site'

const str = z.string().trim()
const url = z.string().trim() // hrefs may be '#anchor', 'mailto:', 'tel:' or absolute

const link = z.object({
  label: str.max(80),
  href: url.max(500),
  newTab: z.boolean().default(false),
})

const photo = z.object({
  src: url.max(1000),
  alt: str.max(200),
  caption: str.max(120).optional().default(''),
  rotate: z.number().min(-8).max(8).optional().default(0),
})

/* --------------------------------------------------------------- sections */

const meta = z.object({
  name: str.min(1).max(80),
  descriptor: str.max(200),
  email: str.max(200),
  phone: str.max(40),
  location: str.max(80),
  linkedin: url.max(500),
  resumeUrl: url.max(1000),
})

const utility = z.object({
  status: str.max(120),
  timezoneLabel: str.max(40),
  timezone: str.max(60),
})

const nav = z.object({
  brand: str.max(60),
  links: z.array(link).max(8),
  cta: link,
})

const hero = z.object({
  eyebrow: str.max(120),
  headlineBefore: str.max(80),
  headlineHighlight: str.max(80),
  headlineAfter: str.max(80),
  subhead: str.max(600),
  primaryCta: link,
  secondaryCta: link,
  portrait: photo,
  scribble: str.max(120),
})

const creds = z.object({
  label: str.max(40),
  items: z.array(z.object({ text: str.max(160), year: str.max(12) })).max(10),
})

const proof = z.object({
  heading: str.max(120),
  metrics: z
    .array(z.object({ value: str.max(16), label: str.max(60), context: str.max(120) }))
    .max(8),
})

const audiences = z.object({
  eyebrow: str.max(60),
  heading: str.max(140),
  intro: str.max(400),
  items: z
    .array(
      z.object({
        key: str.max(40),
        title: str.max(80),
        bring: str.max(240),
        outcomes: z.array(str.max(160)).max(6),
        cta: link,
      })
    )
    .max(6),
})

const ways = z.object({
  eyebrow: str.max(60),
  heading: str.max(140),
  items: z
    .array(
      z.object({
        number: str.max(4),
        title: str.max(60),
        body: str.max(600),
        bullets: z.array(str.max(120)).max(6),
      })
    )
    .max(5),
  workedLabel: str.max(40),
  worked: z.array(z.object({ name: str.max(80), note: str.max(60) })).max(12),
})

const ventures = z.object({
  eyebrow: str.max(60),
  heading: str.max(140),
  intro: str.max(400),
  items: z
    .array(
      z.object({
        name: str.max(80),
        url: url.max(500),
        role: str.max(120),
        period: str.max(60),
        place: str.max(60),
        summary: str.max(600),
        outcomes: z.array(str.max(300)).max(8),
        metrics: z.array(z.object({ value: str.max(16), label: str.max(40) })).max(4),
        status: z.enum(['live', 'building', 'closed']),
        tags: z.array(str.max(30)).max(8),
      })
    )
    .max(8),
})

const projects = z.object({
  eyebrow: str.max(60),
  heading: str.max(140),
  items: z
    .array(
      z.object({
        title: str.max(120),
        kind: str.max(60),
        period: str.max(60),
        body: str.max(600),
        highlights: z.array(str.max(80)).max(6),
        badge: str.max(80),
      })
    )
    .max(10),
})

const pov = z.object({
  eyebrow: str.max(60),
  heading: str.max(140),
  intro: str.max(600),
  items: z
    .array(z.object({ number: str.max(4), title: str.max(80), body: str.max(600) }))
    .max(8),
  pullQuote: str.max(400),
})

const contrasts = z.object({
  eyebrow: str.max(60),
  heading: str.max(140),
  items: z.array(z.object({ before: str.max(80), after: str.max(80) })).max(8),
})

const gallery = z.object({
  eyebrow: str.max(60),
  heading: str.max(140),
  photos: z.array(photo).max(12),
})

const writing = z.object({
  eyebrow: str.max(60),
  heading: str.max(140),
  intro: str.max(400),
  posts: z
    .array(
      z.object({
        title: str.max(160),
        blurb: str.max(300),
        href: url.max(500),
        date: str.max(40),
      })
    )
    .max(12),
  cta: link,
})

const oneCard = z.object({
  heading: str.max(80),
  bullets: z.array(str.max(300)).max(6),
  signature: str.max(40),
})

const closing = z.object({
  heading: str.max(60),
  body: str.max(500),
  primaryCta: link,
  secondaryCta: link,
  note: str.max(160),
})

const footer = z.object({
  links: z.array(link).max(8),
  colophon: str.max(200),
})

/* ------------------------------------------------------------------------ */

/** The only place a section string is trusted. Anything not a key here is rejected. */
export const SECTION_SCHEMAS = {
  meta,
  utility,
  nav,
  hero,
  creds,
  proof,
  audiences,
  ways,
  ventures,
  projects,
  pov,
  contrasts,
  gallery,
  writing,
  oneCard,
  closing,
  footer,
} as const satisfies Record<SectionKey, z.ZodTypeAny>

export type SectionSchemas = typeof SECTION_SCHEMAS

export function isSectionKey(value: unknown): value is SectionKey {
  return typeof value === 'string' && value in SECTION_SCHEMAS
}

/** Human labels + ordering for the /admin index. */
export const SECTION_META: { key: SectionKey; label: string; hint: string }[] = [
  { key: 'meta', label: 'Identity', hint: 'Name, email, phone, résumé link' },
  { key: 'utility', label: 'Status bar', hint: 'Availability line and clock' },
  { key: 'nav', label: 'Navigation', hint: 'Wordmark and menu links' },
  { key: 'hero', label: 'Hero', hint: 'Headline, portrait, main CTAs' },
  { key: 'creds', label: 'Credentials', hint: 'The pill row of awards' },
  { key: 'proof', label: 'Proof numbers', hint: 'Metrics you actually moved' },
  { key: 'audiences', label: 'Who this is for', hint: 'The four audience cards' },
  { key: 'ways', label: 'Ways to work', hint: 'Build / advise / teach' },
  { key: 'ventures', label: 'Ventures', hint: 'Companies, roles, outcomes' },
  { key: 'projects', label: 'Projects & research', hint: 'Builds, papers, patent' },
  { key: 'pov', label: 'Point of view', hint: 'The numbered framework' },
  { key: 'contrasts', label: 'Before → after', hint: 'What changes when you hire me' },
  { key: 'gallery', label: 'Photo wall', hint: 'Taped photos, in the room' },
  { key: 'writing', label: 'Writing', hint: 'Posts and the follow link' },
  { key: 'oneCard', label: 'Why me, one card', hint: 'The notebook page' },
  { key: 'closing', label: 'Contact', hint: "The Let's build block" },
  { key: 'footer', label: 'Footer', hint: 'Links and colophon' },
]
