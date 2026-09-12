// lib/schemas/post.ts
//
// Blog posts and newsletter issues are the same document. The brief asks for a
// "Send as Newsletter" toggle at publish time, which only makes sense if the
// article and the email are one thing with one body.
//
// The document id IS the slug, so /writing/[slug] is a single .get() with no
// query and no index.
//
// The Tiptap document is stored as a JSON *string*, not a map. Firestore cannot
// nest an array directly inside an array, and while today's Tiptap output always
// separates them with a node object, one extension that emits a nested list of
// lists would start throwing on save. A string has no such rule. It also dodges
// `ignoreUndefinedProperties` quietly eating an attribute.

import { z } from 'zod'

export const POST_STATUSES = ['draft', 'scheduled', 'published'] as const
export type PostStatus = (typeof POST_STATUSES)[number]

export const NEWSLETTER_STATUSES = ['idle', 'sending', 'sent', 'failed'] as const

const str = z.string().trim()

/**
 * Firestore's hard limit is ~1 MiB per document and `html` + `doc` share it.
 * These caps leave comfortable headroom for a very long article while failing
 * loudly in the editor instead of silently at the database.
 */
const MAX_HTML = 300_000
const MAX_DOC = 400_000

export const newsletterSchema = z.object({
  /** The "Send as Newsletter" toggle. */
  enabled: z.boolean().default(false),
  /** Defaults to the post title at send time when left empty. */
  subject: str.max(200).default(''),
  status: z.enum(NEWSLETTER_STATUSES).default('idle'),
  sentAt: z.number().int().default(0),
  recipients: z.number().int().min(0).default(0),
  error: str.max(1000).default(''),
})

export const postSchema = z.object({
  slug: str
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { error: 'Lowercase letters, numbers and dashes only.' }),
  title: str.min(1).max(200),
  excerpt: str.max(400).default(''),
  coverUrl: str.max(2000).default(''),
  tags: z.array(str.max(40)).max(12).default([]),

  /** Sanitised server-side on every write — see lib/sanitize.ts. */
  html: z.string().max(MAX_HTML, { error: 'This post is too long to store.' }).default(''),
  /** Tiptap JSON, serialised. Round-trips the editor; never rendered. */
  doc: z.string().max(MAX_DOC).default(''),

  status: z.enum(POST_STATUSES).default('draft'),
  /** Epoch ms. 0 means never published. */
  publishedAt: z.number().int().min(0).default(0),
  /** Epoch ms for `status: 'scheduled'`. */
  scheduledFor: z.number().int().min(0).default(0),
  readingMinutes: z.number().int().min(0).max(600).default(1),
  likes: z.number().int().min(0).default(0),

  newsletter: newsletterSchema.default({
    enabled: false,
    subject: '',
    status: 'idle',
    sentAt: 0,
    recipients: 0,
    error: '',
  }),

  createdAt: z.number().int().default(0),
  updatedAt: z.number().int().default(0),
})

export type Post = z.infer<typeof postSchema> & { id: string }

export const POSTS_COLLECTION = 'posts'

/** ~230 wpm on prose, floored at one minute so nothing reads "0 min". */
export function readingMinutes(html: string): number {
  const words = html
    .replace(/<[^>]*>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 230))
}

/** First ~200 characters of body text, for an empty excerpt. */
export function autoExcerpt(html: string, max = 200): string {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= max) return text
  return `${text.slice(0, text.lastIndexOf(' ', max))}…`
}
