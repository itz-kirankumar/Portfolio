// lib/slots.ts
//
// Booking slot math. Availability ranges are owner wall-clock times
// ("18:00") in availability.tz (e.g. Asia/Kolkata); visitors can be in any
// timezone. Every slot is an absolute instant: owner date+time in owner tz
// -> epoch. Chips group by the VISITOR's local date and times render
// visitor-local, so a 21:00 IST slot correctly lands on the next visitor
// day for timezones ahead of IST. The picker submits the instant (epoch
// ms), never a wall-time string the server would re-parse in its own zone.

const DAY_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const dtfCache = new Map<string, Intl.DateTimeFormat>()
function dtf(tz: string) {
  let f = dtfCache.get(tz)
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
    dtfCache.set(tz, f)
  }
  return f
}

export function zoneParts(epoch: number, tz: string) {
  const parts = dtf(tz).formatToParts(new Date(epoch))
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return { y: get('year'), m: get('month'), d: get('day'), hh: get('hour') % 24, mi: get('minute'), ss: get('second') }
}

/** Wall-clock time in `tz` -> epoch ms. Two correction passes cover zones
 *  whose offset differs across the guess boundary (DST). */
export function zonedToInstant(y: number, m: number, d: number, hh: number, mi: number, tz: string): number {
  const wallAsUtc = Date.UTC(y, m - 1, d, hh, mi)
  let guess = wallAsUtc
  for (let i = 0; i < 3; i++) {
    const p = zoneParts(guess, tz)
    const asUTC = Date.UTC(p.y, p.m - 1, p.d, p.hh, p.mi, p.ss)
    const offset = asUTC - guess
    // Re-anchor to the ORIGINAL wall time each pass: subtracting the
    // measured offset from the guess itself would double-apply it.
    const next = wallAsUtc - offset
    if (next === guess) break
    guess = next
  }
  return guess
}

function parseHHMM(s: string) {
  const [h, m] = s.split(':').map(Number)
  return { h, m }
}

function localDateStr(epoch: number) {
  const d = new Date(epoch)
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

export type Slot = { startMs: number }

type AvailabilityLike = {
  tz?: string
  horizonDays: number
  leadTimeHours: number
  slotStepMins: number
  weekly: Record<string, { enabled: boolean; ranges: { start: string; end: string }[] }>
  dateOverrides?: Record<string, { ranges: { start: string; end: string }[] }>
}

type ServiceLike = { durationMins: number; bufferMins?: number }

/**
 * All bookable slots across the horizon, grouped by the visitor's local
 * date ("YYYY-MM-DD" in the runtime's local timezone). `nowMs` is injected
 * so fixtures can pin the instant.
 */
export function generateSlotsByVisitorDate(
  availability: AvailabilityLike,
  service: ServiceLike,
  upcomingBookings: { start: number; end: number }[],
  nowMs: number,
): Map<string, Slot[]> {
  const ownerTz = availability.tz || 'Asia/Kolkata'
  const leadTimeMs = availability.leadTimeHours * 3600000
  const duration = service.durationMins
  const buffer = service.bufferMins || 0
  const step = availability.slotStepMins
  const map = new Map<string, Slot[]>()

  // Iterate days as the OWNER experiences them, so weekly rules and
  // overrides apply to the right calendar date in the owner's tz.
  const today = zoneParts(nowMs, ownerTz)
  for (let i = 0; i <= availability.horizonDays; i++) {
    const dayNoonUtc = Date.UTC(today.y, today.m - 1, today.d + i, 12)
    const dayParts = zoneParts(dayNoonUtc, ownerTz)
    const dateStr = [
      dayParts.y,
      String(dayParts.m).padStart(2, '0'),
      String(dayParts.d).padStart(2, '0'),
    ].join('-')

    const override = availability.dateOverrides?.[dateStr]
    let ranges: { start: string; end: string }[] = []
    if (override) {
      ranges = override.ranges || []
    } else {
      // Weekday is a property of the calendar date itself; the noon-UTC
      // construction above keeps UTC day == owner day.
      const ownerWeekday = DAY_NAMES[new Date(Date.UTC(dayParts.y, dayParts.m - 1, dayParts.d, 12)).getUTCDay()]
      const rules = availability.weekly[ownerWeekday]
      if (rules?.enabled) ranges = rules.ranges || []
    }
    if (ranges.length === 0) continue

    for (const range of ranges) {
      const { h: sh, m: sm } = parseHHMM(range.start)
      const { h: eh, m: em } = parseHHMM(range.end)
      let cur = zonedToInstant(dayParts.y, dayParts.m, dayParts.d, sh, sm, ownerTz)
      const end = zonedToInstant(dayParts.y, dayParts.m, dayParts.d, eh, em, ownerTz)

      while (cur + duration * 60000 <= end) {
        if (cur - nowMs > leadTimeMs) {
          const slotEnd = cur + (duration + buffer) * 60000
          const hasOverlap = upcomingBookings.some((b) => cur < b.end && slotEnd > b.start)
          if (!hasOverlap) {
            const key = localDateStr(cur)
            if (!map.has(key)) map.set(key, [])
            map.get(key)!.push({ startMs: cur })
          }
        }
        cur += step * 60000
      }
    }
  }
  return map
}
