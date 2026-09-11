// lib/schemas/service.ts
//
// A bookable offering: 1:1 mentorship, a resume review, an advisory call.
// The document id is the slug, so /services/[slug] is a single .get().
//
// Money is stored in the smallest currency unit (paise for INR). Razorpay wants
// it that way, and floats plus money is how you end up charging ₹999.9999998.

import { z } from 'zod'

export const PAYMENT_MODES = ['razorpay', 'link', 'free'] as const
export type PaymentMode = (typeof PAYMENT_MODES)[number]

const str = z.string().trim()

export const serviceSchema = z.object({
  slug: str
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { error: 'Lowercase letters, numbers and dashes only.' }),
  title: str.min(1).max(120),
  summary: str.max(400).default(''),
  /** Long description. Sanitised HTML from the same editor as posts. */
  body: z.string().max(60_000).default(''),
  coverUrl: str.max(2000).default(''),
  /** Short selling points shown as a list on the service card. */
  highlights: z.array(str.max(160)).max(8).default([]),

  durationMins: z.number().int().min(5).max(600).default(45),
  /** Dead time after each booking, so back-to-back calls are not possible. */
  bufferMins: z.number().int().min(0).max(240).default(15),
  /** 0 = unlimited. Guards against a week that eats every evening. */
  maxPerWeek: z.number().int().min(0).max(100).default(0),

  /** Smallest currency unit. 0 with mode 'free' means genuinely free. */
  priceInPaise: z.number().int().min(0).max(100_000_000).default(0),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).default('INR'),

  paymentMode: z.enum(PAYMENT_MODES).default('razorpay'),
  /** Only read when paymentMode is 'link' — a Razorpay Payment Link. */
  paymentLinkUrl: str.max(2000).default(''),

  active: z.boolean().default(true),
  /** Manual ordering on /services. Lower first. */
  order: z.number().int().min(0).max(999).default(100),

  createdAt: z.number().int().default(0),
  updatedAt: z.number().int().default(0),
})

export type Service = z.infer<typeof serviceSchema> & { id: string }

export const SERVICES_COLLECTION = 'services'

const SYMBOLS: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }

/** `199900` + `INR` -> `₹1,999`. Drops trailing `.00`, keeps real paise. */
export function formatPrice(paise: number, currency = 'INR'): string {
  if (paise <= 0) return 'Free'
  const major = paise / 100
  const body = Number.isInteger(major)
    ? major.toLocaleString('en-IN')
    : major.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${SYMBOLS[currency] ?? ''}${body}`
}

/** Total minutes a booking occupies on the calendar, including its buffer. */
export function occupiedMins(service: Pick<Service, 'durationMins' | 'bufferMins'>): number {
  return service.durationMins + service.bufferMins
}
