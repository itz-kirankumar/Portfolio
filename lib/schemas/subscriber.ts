// lib/schemas/subscriber.ts
//
// The document id is sha256(lowercased email), which does two things: signing up
// twice is idempotent without a query, and the raw address never appears in a
// document path (paths show up in logs, index keys and error traces).

import { z } from 'zod'

export const SUBSCRIBER_STATUSES = ['active', 'unsubscribed'] as const
export type SubscriberStatus = (typeof SUBSCRIBER_STATUSES)[number]

const str = z.string().trim()

export const subscriberSchema = z.object({
  email: z.string().trim().toLowerCase().email({ error: 'That does not look like an email address.' }).max(320),
  name: str.max(120).default(''),
  status: z.enum(SUBSCRIBER_STATUSES).default('active'),
  /** Where they came from: 'newsletter-page', 'footer', 'import', 'manual'. */
  source: str.max(40).default('unknown'),
  /** Opaque token in the unsubscribe link. Rotated never; deleted with the row. */
  token: str.max(64).default(''),
  createdAt: z.number().int().default(0),
  unsubscribedAt: z.number().int().default(0),
})

export type Subscriber = z.infer<typeof subscriberSchema> & { id: string }

export const SUBSCRIBERS_COLLECTION = 'subscribers'

/** Accepts one email per line or a comma/semicolon list; dedupes, lowercases. */
export function parseEmailList(input: string): string[] {
  const seen = new Set<string>()
  for (const raw of input.split(/[\s,;]+/)) {
    const email = raw.trim().toLowerCase()
    // Deliberately loose: the schema is the real gate. This only splits input.
    if (email.includes('@') && email.includes('.')) seen.add(email)
  }
  return [...seen]
}
