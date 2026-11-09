// lib/schemas/work.ts
//
// A showcased piece of work: a product, venture, tool, paper or experiment.
// The document id is the slug, so /work/[slug] is a single .get() and the URL
// never changes when the title does.
//
// Works power three surfaces: the flowing wall on the homepage, the /work
// index, and one detail page per work. `body` is plain text; blank lines split
// paragraphs. Keep links in liveUrl/sourceUrl, not inline.

import { z } from 'zod'

export const WORK_KINDS = ['product', 'venture', 'tool', 'research', 'experiment'] as const
export type WorkKind = (typeof WORK_KINDS)[number]

export const WORK_STATUSES = ['live', 'building', 'closed', 'repository'] as const
export type WorkStatus = (typeof WORK_STATUSES)[number]

const str = z.string().trim()
const url = z.string().trim().max(1000)

export const workSchema = z.object({
  slug: str
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { error: 'Lowercase letters, numbers and dashes only.' }),

  title: str.min(1).max(120),
  /** One line, shown on wall cards and under the title on the detail page. */
  tagline: str.max(200).default(''),

  kind: z.enum(WORK_KINDS).default('product'),
  status: z.enum(WORK_STATUSES).default('live'),
  /** e.g. "2025 — now" or "Jun–Oct 2026". */
  period: str.max(60).default(''),

  /** Two or three sentences. Wall cards and the index lead with this. */
  summary: str.max(600).default(''),
  /** The long story for /work/[slug]. Blank line between paragraphs. */
  body: z.string().max(30_000).default(''),

  coverUrl: url.default(''),
  /** Public live site. Empty hides the button. */
  liveUrl: url.default(''),
  /** Public source repository only — never link a private repo here. */
  sourceUrl: url.default(''),

  tags: z.array(str.max(30)).max(10).default([]),
  highlights: z.array(str.max(160)).max(8).default([]),
  metrics: z
    .array(z.object({ value: str.max(16), label: str.max(60) }))
    .max(6)
    .default([]),

  /** Featured works lead the homepage wall. */
  featured: z.boolean().default(false),
  /** Manual ordering on /work and the wall. Lower first. */
  order: z.number().int().min(0).max(999).default(100),

  createdAt: z.number().int().default(0),
  updatedAt: z.number().int().default(0),
})

export type Work = z.infer<typeof workSchema> & { id: string }

export const WORKS_COLLECTION = 'works'

export const KIND_LABEL: Record<WorkKind, string> = {
  product: 'Product',
  venture: 'Venture',
  tool: 'Tool',
  research: 'Research',
  experiment: 'Experiment',
}

export const STATUS_LABEL: Record<WorkStatus, string> = {
  live: 'live',
  building: 'building now',
  closed: 'wound down',
  repository: 'public repo',
}
