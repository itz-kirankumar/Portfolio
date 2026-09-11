// lib/ids.ts
//
// Document ids and slugs.
//
// `newId()` is time-ordered on purpose. Firestore has no "order by creation"
// without an indexed field, and a lexicographically sortable id means the media
// grid can `orderBy(documentId)` and get newest-first for free — no composite
// index, no extra field to keep in sync.

import { createHash, randomBytes } from 'node:crypto'

const B36 = 36

/**
 * Sortable id: base36 milliseconds + 6 random chars.
 * e.g. `m9x1k2p3-4f7a2c`. Padded so the prefix keeps a fixed width until 2059.
 */
export function newId(): string {
  const time = Date.now().toString(B36).padStart(8, '0')
  const rand = randomBytes(4).toString('hex').slice(0, 6)
  return `${time}-${rand}`
}

/** URL-safe slug. Returns '' for input with no usable characters — callers decide. */
export function slugify(input: string, maxLength = 70): string {
  return input
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '') // strip combining accents left by NFKD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/g, '')
}

/**
 * A slug not already present in `taken`. Appends -2, -3, … rather than a random
 * suffix so a retitled post keeps a readable URL.
 */
export function uniqueSlug(input: string, taken: Iterable<string>, fallback = 'untitled'): string {
  const base = slugify(input) || fallback
  const used = new Set(taken)
  if (!used.has(base)) return base

  for (let n = 2; n < 500; n += 1) {
    const candidate = `${base}-${n}`
    if (!used.has(candidate)) return candidate
  }
  return `${base}-${newId()}`
}

/**
 * Stable id for an email address. Used as the `subscribers` document id so
 * signing up twice is idempotent without a query, and so the raw address is not
 * in the document path (which shows up in logs and index keys).
 */
export function emailId(email: string): string {
  return createHash('sha256').update(email.trim().toLowerCase()).digest('hex').slice(0, 32)
}

/** Opaque token for unsubscribe links. */
export function newToken(): string {
  return randomBytes(16).toString('hex')
}

/** Booking document id. Deterministic, so Firestore's `.create()` is the slot lock. */
export function bookingId(serviceId: string, startISO: string): string {
  return `${serviceId}__${startISO.replace(/[:.]/g, '-')}`
}
