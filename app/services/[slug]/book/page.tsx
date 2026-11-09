import { notFound, redirect } from 'next/navigation'
import { safeGet, safeList, createStrict } from '@/lib/store'
import { SERVICES_COLLECTION, serviceSchema } from '@/lib/schemas/service'
import { bookingSchema, BOOKINGS_COLLECTION } from '@/lib/schemas/booking'
import { AVAILABILITY_COLLECTION, AVAILABILITY_DOC, availabilitySchema, DEFAULT_AVAILABILITY } from '@/lib/schemas/availability'
import { bookingId } from '@/lib/ids'
import { formatPrice } from '@/lib/schemas/service'
import { Section, NotebookCard } from '@/components/ui/primitives'
import Reveal from '@/components/ui/Reveal'
import { SlotPicker } from './SlotPicker'
import { hasCalendarWriteScope } from '@/lib/calendar-scope'

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = await safeGet(SERVICES_COLLECTION, slug, serviceSchema)

  if (!service || !service.active) {
    notFound()
  }

  const availability = await safeGet(AVAILABILITY_COLLECTION, AVAILABILITY_DOC, availabilitySchema) || DEFAULT_AVAILABILITY
  const allBookings = await safeList(BOOKINGS_COLLECTION, bookingSchema)
  const nowMs = Date.now()
  let upcomingBookings = allBookings
    .filter(b => b.status !== 'cancelled' && new Date(b.endISO).getTime() > nowMs)
    .map(b => ({
      start: new Date(b.startISO).getTime(),
      end: new Date(b.endISO).getTime()
    }))

  if (Object.keys(availability.googleRefreshTokens || {}).length > 0 || availability.googleRefreshToken || availability.googleCalendarId) {
    try {
      const { GoogleAuth, OAuth2Client } = await import('google-auth-library')
      
      const horizonDate = new Date()
      horizonDate.setDate(horizonDate.getDate() + availability.horizonDays + 1)
      
      const allTokens = Object.values(availability.googleRefreshTokens || {}) as string[]
      if (availability.googleRefreshToken && !allTokens.includes(availability.googleRefreshToken)) {
        allTokens.push(availability.googleRefreshToken)
      }

      if (allTokens.length > 0) {
        // Sync using all available OAuth tokens (multi-admin sync)
        for (const token of allTokens) {
          const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)
          client.setCredentials({ refresh_token: token })
          
          const listRes = await client.request({ url: 'https://www.googleapis.com/calendar/v3/users/me/calendarList' })
          const items = (listRes.data as any).items || []
          const cIds = items.filter((c: any) => c.selected !== false).map((c: any) => c.id)
          
          if (cIds.length > 0) {
            const res = await client.request({
              url: 'https://www.googleapis.com/calendar/v3/freeBusy',
              method: 'POST',
              data: {
                timeMin: new Date().toISOString(),
                timeMax: horizonDate.toISOString(),
                items: cIds.map((id: string) => ({ id }))
              }
            })
            
            const calendars = (res.data as any).calendars
            if (calendars) {
              for (const calId of cIds) {
                const cal = calendars[calId]
                if (cal && cal.busy) {
                   const googleBusySlots = cal.busy.map((b: any) => ({
                     start: new Date(b.start).getTime(),
                     end: new Date(b.end).getTime()
                   }))
                   upcomingBookings = upcomingBookings.concat(googleBusySlots)
                }
              }
            }
          }
        }
      } else if (availability.googleCalendarId) {
        // Fallback to Service Account manual sync
        const auth = new GoogleAuth({
          credentials: {
            client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          },
          scopes: ['https://www.googleapis.com/auth/calendar.readonly']
        })
        const client = await auth.getClient()
        const calendarIds = availability.googleCalendarId.split(',').map((id: string) => id.trim()).filter(Boolean)
        
        if (calendarIds.length > 0) {
          const res = await client.request({
            url: 'https://www.googleapis.com/calendar/v3/freeBusy',
            method: 'POST',
            data: {
              timeMin: new Date().toISOString(),
              timeMax: horizonDate.toISOString(),
              items: calendarIds.map((id: string) => ({ id }))
            }
          })
          
          const calendars = (res.data as any).calendars
          if (calendars) {
            for (const calId of calendarIds) {
              const cal = calendars[calId]
              if (cal && cal.busy) {
                 const googleBusySlots = cal.busy.map((b: any) => ({
                   start: new Date(b.start).getTime(),
                   end: new Date(b.end).getTime()
                 }))
                 upcomingBookings = upcomingBookings.concat(googleBusySlots)
              }
            }
          }
        }
      }
    } catch (e: any) {
      // If the API isn't enabled yet, log a warning rather than an error to avoid triggering the Next.js dev overlay
      if (e?.message?.includes('not been used in project') || e?.message?.includes('is disabled')) {
        console.warn('\n\n[Google Calendar API not enabled]')
        console.warn(e.message)
        console.warn('Please visit the link above in your browser to enable the Calendar API.\n\n')
      } else {
        console.error('Google Calendar error:', e)
      }
    }
  }

  if (service.paymentMode === 'link' && service.paymentLinkUrl) {
    redirect(service.paymentLinkUrl)
  }

  // A paid booking promises a Meet invite by email. Until the calendar
  // connection can actually create that invite, do not take money.
  const bookingClosed = !service.bookingOpen
  const paidButNoInvite = service.paymentMode === 'razorpay' && service.priceInPaise > 0
    ? !(await hasCalendarWriteScope())
    : false

    async function handleBook(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const notes = formData.get('notes') as string
    
    let startISO = new Date().toISOString()
    let endISO = new Date().toISOString()

    if (service!.type !== 'digital_download') {
      // The picker submits an absolute instant (epoch ms). Wall-time strings
      // would be re-parsed here in the server's timezone, silently moving
      // the meeting. Bounds-check against the availability horizon.
      const startMs = Number(formData.get('startMs'))

      if (!name || !email || !Number.isFinite(startMs) || startMs <= 0) {
        throw new Error('Please fill all required fields')
      }
      const nowMs = Date.now()
      const maxMs = nowMs + (availability.horizonDays + 2) * 86400000
      if (startMs < nowMs || startMs > maxMs) {
        throw new Error('That slot is outside the bookable window')
      }

      startISO = new Date(startMs).toISOString()
      endISO = new Date(startMs + service!.durationMins * 60000).toISOString()
    } else {
      if (!name || !email) {
        throw new Error('Please fill all required fields')
      }
    }
    
    const docId = bookingId(service!.id, startISO)
    
    await createStrict(BOOKINGS_COLLECTION, docId, bookingSchema, {
      serviceId: service!.id,
      serviceTitle: service!.title,
      name,
      email,
      notes,
      startISO,
      endISO,
      tz: availability.tz || 'Asia/Kolkata',
      durationMins: service!.type === 'digital_download' ? 0 : service!.durationMins,
      status: 'pending',
      payment: {
        mode: service!.paymentMode,
        amount: service!.priceInPaise,
        currency: service!.currency,
        orderId: '',
        paymentId: '',
        verifiedAt: 0,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    if (service!.paymentMode === 'razorpay') {
      redirect(`/services/${slug}/book/${docId}/checkout`)
    }

    redirect(`/services/${slug}/book/success`)
  }

  return (
    <Section tone="paper">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">

          {/* Left: what this session is. Mirrors the reference layout Kiran
              picked: details and (real) testimonials left, booking right. */}
          <Reveal kind="up" className="min-w-0">
            <NotebookCard>
              <h1 className="font-display text-[clamp(1.6rem,3.5vw,2.25rem)] font-semibold leading-tight tracking-[-0.02em] text-ink">
                {service.title}
              </h1>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
                {service.summary}
              </p>

              <div className="mt-6 grid grid-cols-3 divide-x divide-rule rounded-xl border border-rule bg-paper-deep/40">
                <div className="px-4 py-3">
                  <p className="font-display text-lg font-semibold text-ink">
                    {formatPrice(service.priceInPaise, service.currency)}
                    {service.mrpInPaise > service.priceInPaise && (
                      <span className="ml-2 align-middle font-mono text-xs font-normal text-ink-soft line-through">
                        {formatPrice(service.mrpInPaise, service.currency)}
                      </span>
                    )}
                  </p>
                </div>
                <div className="px-4 py-3 flex items-center gap-1.5 text-sm text-ink">
                  {service.type === 'digital_download' ? 'Instant download' : `${service.durationMins} mins`}
                </div>
                <div className="px-4 py-3 flex items-center gap-1.5 text-sm text-ink">
                  {service.type === 'digital_download' ? 'Digital file' : 'Video Meeting'}
                </div>
              </div>

              {service.highlights.length > 0 && (
                <ul className="mt-6 space-y-3">
                  {service.highlights.map((h, i) => (
                    <li key={i} className="flex gap-3 text-[0.9rem] leading-relaxed text-ink-soft">
                      <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-coral" />
                      {h}
                    </li>
                  ))}
                </ul>
              )}

              {service.body && (
                <div
                  className="prose prose-stone mt-6 max-w-none text-[0.9rem] text-ink-soft"
                  dangerouslySetInnerHTML={{ __html: service.body }}
                />
              )}

              {/* Testimonials render here once real, post-call ones exist.
                  None exist yet, so nothing renders - no placeholder quotes. */}
            </NotebookCard>
          </Reveal>

          {/* Right: the booking panel. The paid gate lives here, unchanged. */}
          <Reveal kind="up" delay={60} className="min-w-0">
            <NotebookCard>
              {(bookingClosed || paidButNoInvite) ? (
                <div className="text-center py-8">
                  <p className="font-display text-xl font-semibold text-ink">Booking opens soon</p>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
                    Online booking for this session opens soon - the schedule and session details are being
                    finalised. No payment is taken while this notice is up. Please check back shortly.
                  </p>
                </div>
              ) : (
              <form data-clarity-mask="true" action={handleBook} className="flex flex-col gap-6">
                {service.type !== 'digital_download' && (
                  <SlotPicker
                    service={service}
                    availability={availability}
                    upcomingBookings={upcomingBookings}
                  />
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-ink mb-1.5">
                    Name <span className="text-coral">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full rounded-md border border-rule bg-paper px-4 py-2 text-ink shadow-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
                    Email <span className="text-coral">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full rounded-md border border-rule bg-paper px-4 py-2 text-ink shadow-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-ink mb-1.5">
                    {service.type === 'digital_download' ? 'Notes (Optional)' : 'What would you like to discuss?'}
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="w-full rounded-md border border-rule bg-paper px-4 py-2 text-ink shadow-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] px-7 py-3.5 text-[1rem] bg-coral-deep text-white shadow-paper hover:-translate-y-0.5 hover:bg-coral-ink hover:shadow-lift"
                  >
                    Continue
                  </button>
                </div>
              </form>
              )}
            </NotebookCard>
          </Reveal>
        </div>
      </div>
    </Section>
  )
}
