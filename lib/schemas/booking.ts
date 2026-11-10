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

export const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'] as const
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
  /** Invite delivery state, visible in admin so a paid booking can never
   *  silently go unfulfilled. */
  /** Unguessable receipt key for the post-payment confirmation page. The
   *  booking id is deterministic ({serviceId}__{startISO}), so id alone must
   *  never authorise showing booking state - the success page requires this. */
  receiptToken: str.max(80).default(''),
  inviteStatus: z.enum(['none', 'sent', 'failed']).default('none'),
  inviteError: str.max(500).default(''),
  inviteEventId: str.max(120).default(''),
  meetLink: str.max(300).default(''),
  createdAt: z.number().int().default(0),
  updatedAt: z.number().int().default(0),
})

export type Booking = z.infer<typeof bookingSchema> & { id: string }

export const BOOKINGS_COLLECTION = 'bookings'

/** Statuses that still occupy their slot. A cancelled booking frees it again. */
export const BLOCKING_STATUSES: BookingStatus[] = ['pending', 'confirmed']

/**
 * How long an unpaid paid-mode booking holds its slot before the hold expires
 * (owner rule, 10 Nov 2026: "if unpaid, release that slot after 2 min").
 * After this, the slot is bookable again; if the guest still pays afterwards,
 * verifyPayment confirms the booking anyway - money always wins over a sweep.
 */
export const UNPAID_HOLD_MS = 2 * 60 * 1000

type SlotBlocker = Pick<Booking, 'status' | 'createdAt' | 'payment'>

/**
 * True while this booking still holds its slot. A paid-mode booking whose
 * payment never verified stops blocking after UNPAID_HOLD_MS. Free-mode and
 * confirmed bookings block as before.
 */
export function blocksSlot(b: SlotBlocker, nowMs: number): boolean {
  if (b.status === 'confirmed') return true
  if (b.status !== 'pending') return false
  const needsPayment = b.payment.mode === 'razorpay' && b.payment.amount > 0
  if (!needsPayment) return true
  return b.payment.verifiedAt > 0 || nowMs - b.createdAt <= UNPAID_HOLD_MS
}
