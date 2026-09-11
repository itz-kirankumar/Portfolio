// lib/schemas/booking.ts
//
// The document id is `{serviceId}__{startISO}` (see lib/ids.ts bookingId).
// That is the entire concurrency story: two people clicking the same slot both
// call Firestore's `.create()`, the second gets ALREADY_EXISTS, and there is no
// read-then-write window to lose. A random id plus a "is this slot free?" query
// would double-book under exactly the load you most want it not to.
//
// Service title and price are denormalised onto the booking on purpose. Deleting
// a service must not turn last month's confirmed bookings into orphan rows with
// no name and no amount.

import { z } from 'zod'
import { PAYMENT_MODES } from './service'

export const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled'] as const
export type BookingStatus = (typeof BOOKING_STATUSES)[number]

const str = z.string().trim()

export const paymentSchema = z.object({
  mode: z.enum(PAYMENT_MODES).default('free'),
  amount: z.number().int().min(0).default(0),
  currency: str.max(8).default('INR'),
  orderId: str.max(120).default(''),
  paymentId: str.max(120).default(''),
  /** Epoch ms when a signature actually verified. 0 means unpaid. */
  verifiedAt: z.number().int().min(0).default(0),
})

export const bookingSchema = z.object({
  serviceId: str.min(1).max(80),
  serviceTitle: str.max(120).default(''),

  name: str.min(1, { error: 'Please add your name.' }).max(120),
  email: z.string().trim().toLowerCase().email({ error: 'Please add a valid email.' }).max(320),
  phone: str.max(40).default(''),
  notes: str.max(2000).default(''),

  /** UTC ISO, always. Display timezone comes from availability.tz. */
  startISO: z.string().datetime({ error: 'Invalid slot.' }),
  endISO: z.string().datetime({ error: 'Invalid slot.' }),
  /** The visitor's IANA zone, recorded so a confirmation reads in their time. */
  tz: str.max(60).default('UTC'),
  durationMins: z.number().int().min(5).max(600).default(45),

  status: z.enum(BOOKING_STATUSES).default('pending'),
  payment: paymentSchema.default({
    mode: 'free',
    amount: 0,
    currency: 'INR',
    orderId: '',
    paymentId: '',
    verifiedAt: 0,
  }),

  cancelReason: str.max(500).default(''),
  createdAt: z.number().int().default(0),
  updatedAt: z.number().int().default(0),
})

export type Booking = z.infer<typeof bookingSchema> & { id: string }

export const BOOKINGS_COLLECTION = 'bookings'

/** Statuses that still occupy their slot. A cancelled booking frees it again. */
export const BLOCKING_STATUSES: BookingStatus[] = ['pending', 'confirmed']
