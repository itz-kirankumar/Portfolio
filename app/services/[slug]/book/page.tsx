import { notFound, redirect } from 'next/navigation'
import { safeGet, safeList, createStrict } from '@/lib/store'
import { SERVICES_COLLECTION, serviceSchema } from '@/lib/schemas/service'
import { bookingSchema, BOOKINGS_COLLECTION } from '@/lib/schemas/booking'
import { AVAILABILITY_COLLECTION, AVAILABILITY_DOC, availabilitySchema, DEFAULT_AVAILABILITY } from '@/lib/schemas/availability'
import { bookingId } from '@/lib/ids'
import { Section, NotebookCard, SectionHead } from '@/components/ui/primitives'
import Reveal from '@/components/ui/Reveal'
import { SlotPicker } from './SlotPicker'

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
      
      const allTokens = Object.values(availability.googleRefreshTokens || {})
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

    async function handleBook(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const notes = formData.get('notes') as string
    
    let startISO = new Date().toISOString()
    let endISO = new Date().toISOString()

    if (service!.type !== 'digital_download') {
      const dateStr = formData.get('date') as string
      const timeStr = formData.get('time') as string
      
      if (!name || !email || !dateStr || !timeStr) {
        throw new Error('Please fill all required fields')
      }

      const start = new Date(`${dateStr}T${timeStr}:00`)
      startISO = start.toISOString()
      endISO = new Date(start.getTime() + service!.durationMins * 60000).toISOString()
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
      tz: 'UTC',
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
      <div className="mx-auto max-w-2xl">
        <Reveal kind="up">
          <SectionHead
            align="center"
            heading={service.type === 'digital_download' ? `Get ${service.title}` : `Book ${service.title}`}
            intro={service.summary}
          />
        </Reveal>

        <Reveal kind="up" delay={60}>
          <NotebookCard className="mt-10">
            <form action={handleBook} className="flex flex-col gap-6">
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

              {service.type !== 'digital_download' && (
                <SlotPicker 
                  service={service} 
                  availability={availability} 
                  upcomingBookings={upcomingBookings}
                />
              )}

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-ink mb-1.5">
                  {service.type === 'digital_download' ? 'Notes (Optional)' : 'What would you like to discuss?'}
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  className="w-full rounded-md border border-rule bg-paper px-4 py-2 text-ink shadow-sm focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
                ></textarea>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] px-7 py-3.5 text-[1rem] bg-coral-deep text-white shadow-paper hover:-translate-y-0.5 hover:bg-coral-ink hover:shadow-lift"
                >
                  {service.type === 'digital_download' ? 'Proceed to Checkout' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </NotebookCard>
        </Reveal>
      </div>
    </Section>
  )
}
