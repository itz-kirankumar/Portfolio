// lib/schemas/availability.ts
//
// Singleton: `availability/default`. One owner, one calendar.
//
// Weekly rules are a map of day -> { enabled, ranges: [{start, end}] }. Firestore
// cannot nest an array directly inside an array, so the day object in between is
// load-bearing, not decoration.
//
// Times are local wall-clock strings ("09:00") interpreted in `tz`. Storing them
// as instants would be wrong: "I work 9am-5pm" must survive a DST shift, and an
// absolute timestamp would silently become 8am-4pm in November.

import { z } from 'zod'

export const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
export type DayKey = (typeof DAY_KEYS)[number]

export const DAY_LABELS: Record<DayKey, string> = {
  sun: 'Sunday',
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
}

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/

const timeRange = z
  .object({
    start: z.string().regex(HHMM, { error: 'Use 24-hour HH:MM.' }).default('09:00'),
    end: z.string().regex(HHMM, { error: 'Use 24-hour HH:MM.' }).default('17:00'),
  })
  .refine((r) => r.start < r.end, { error: 'End must be after start.' })

const daySchema = z.object({
  enabled: z.boolean().default(false),
  ranges: z.array(timeRange).max(6).default([]),
})

const blankDay = { enabled: false, ranges: [] as { start: string; end: string }[] }

export const availabilitySchema = z.object({
  /** IANA zone the weekly rules are expressed in, e.g. "Asia/Kolkata". */
  tz: z.string().trim().max(60).default('Asia/Kolkata'),

  weekly: z
    .object({
      sun: daySchema.default(blankDay),
      mon: daySchema.default(blankDay),
      tue: daySchema.default(blankDay),
      wed: daySchema.default(blankDay),
      thu: daySchema.default(blankDay),
      fri: daySchema.default(blankDay),
      sat: daySchema.default(blankDay),
    })
    .default({
      sun: blankDay,
      mon: blankDay,
      tue: blankDay,
      wed: blankDay,
      thu: blankDay,
      fri: blankDay,
      sat: blankDay,
    }),

  /** One-off closures or custom hours. Key is "YYYY-MM-DD" in `tz`. If ranges is empty, it's a blocked date. */
  dateOverrides: z
    .record(z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.object({ ranges: z.array(timeRange).max(6) }))
    .default({}),

  /** Nothing bookable sooner than this, so you are never ambushed. */
  leadTimeHours: z.number().int().min(0).max(720).default(12),
  /** How far ahead the picker shows. */
  horizonDays: z.number().int().min(1).max(180).default(30),
  /** Slot grid granularity in minutes. */
  slotStepMins: z.number().int().min(5).max(240).default(30),

  /** Google Calendar ID to check for busy slots (usually your gmail address). Requires service account to be shared. */
  googleCalendarId: z.string().trim().max(120).default(''),
  /** OAuth Refresh Token stored automatically upon admin login */
  googleRefreshToken: z.string().optional(),
  /** Map of email -> Refresh Token to sync multiple admin accounts at once */
  googleRefreshTokens: z.record(z.string(), z.string()).optional(),

  updatedAt: z.number().int().default(0),
})

export type Availability = z.infer<typeof availabilitySchema>

export const AVAILABILITY_COLLECTION = 'availability'
export const AVAILABILITY_DOC = 'default'

/** Used whenever the document is missing, so the picker never crashes. */
export const DEFAULT_AVAILABILITY: Availability = availabilitySchema.parse({
  tz: 'Asia/Kolkata',
  weekly: {
    sun: blankDay,
    mon: { enabled: true, ranges: [{ start: '18:00', end: '21:00' }] },
    tue: { enabled: true, ranges: [{ start: '18:00', end: '21:00' }] },
    wed: { enabled: true, ranges: [{ start: '18:00', end: '21:00' }] },
    thu: { enabled: true, ranges: [{ start: '18:00', end: '21:00' }] },
    fri: { enabled: true, ranges: [{ start: '18:00', end: '21:00' }] },
    sat: { enabled: true, ranges: [{ start: '10:00', end: '14:00' }] },
  },
})
