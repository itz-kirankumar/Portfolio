import { Button, Section, SectionHead } from '@/components/ui/primitives'
import Reveal from '@/components/ui/Reveal'

import { safeGet } from '@/lib/store'
import { SERVICES_COLLECTION, serviceSchema } from '@/lib/schemas/service'
import { BOOKINGS_COLLECTION, bookingSchema } from '@/lib/schemas/booking'

export const dynamic = 'force-dynamic'

const CONTACT_EMAIL = 'kiran.kumar2028@mastersunion.org'

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ b?: string; k?: string }>
}) {
  const { slug } = await params
  const { b, k } = await searchParams
  const service = await safeGet(SERVICES_COLLECTION, slug, serviceSchema)

  const isDigital = service?.type === 'digital_download'

  // The paid flow lands here with ?b=<bookingId> right after the signature
  // verifies, so the invite attempt has already finished and its outcome is
  // final. The id is a capability: it proves nothing sensitive by itself, so
  // this page never renders the guest's name, email or Meet link - only the
  // slot, the reference and the delivery state.
  // The booking id is deterministic, so it authorises nothing by itself:
  // booking state renders only with the unguessable receipt token minted at
  // booking time. Enumeration of ids yields the generic page, never data.
  const booking = b ? await safeGet(BOOKINGS_COLLECTION, b, bookingSchema) : null
  const receiptOk =
    booking !== null && booking.receiptToken !== '' && k === booking.receiptToken
  const confirmed =
    !isDigital &&
    receiptOk &&
    booking.serviceId === slug &&
    booking.status === 'confirmed'

  const slotLabel = confirmed
    ? new Date(booking.startISO).toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: booking.tz || 'Asia/Kolkata',
      })
    : ''

  return (
    <Section tone="paper">
      <div className="mx-auto max-w-2xl text-center py-20">
        <Reveal kind="up">
          <SectionHead
            align="center"
            heading={
              isDigital
                ? 'Purchase Confirmed!'
                : confirmed
                  ? 'Booking Confirmed!'
                  : receiptOk
                    ? 'Booking not confirmed yet'
                    : 'Booking status'
            }
            intro={
              isDigital
                ? 'Thank you for your purchase. You can download your file below.'
                : confirmed
                  ? `${booking.serviceTitle || service?.title || 'Your call'} - ${slotLabel} (${booking.tz || 'Asia/Kolkata'})`
                  : receiptOk
                    ? 'This booking has not been confirmed. If you completed payment, email us with your booking reference and we will sort it out.'
                    : 'Booking details show only on the link you get right after booking. If you were expecting a confirmation here, use that link from your browser.'
            }
          />
        </Reveal>

        {confirmed && (
          <Reveal kind="up" delay={40}>
            <div className="mt-8 space-y-4 text-[0.95rem] leading-relaxed text-ink-soft">
              <p>
                Booking reference:{' '}
                <code className="rounded bg-paper-deep px-2 py-1 font-mono text-[0.8rem] text-ink">
                  {booking.id}
                </code>
              </p>

              {booking.inviteStatus === 'sent' ? (
                <p>
                  A calendar invite with the Google Meet link has been sent to your email.
                  Please accept it so the call lands in your calendar.
                </p>
              ) : booking.inviteStatus === 'failed' ? (
                <p>
                  Your booking is confirmed and paid, but the calendar invite did not go
                  out automatically. Email{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="link-underline">
                    {CONTACT_EMAIL}
                  </a>{' '}
                  with your booking reference and I will send you the Meet link directly.
                </p>
              ) : (
                <p>You will receive a calendar invite with the Google Meet link by email.</p>
              )}

              <p>
                Need to move your call? One reschedule is allowed - email{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="link-underline">
                  {CONTACT_EMAIL}
                </a>{' '}
                with your booking reference.
              </p>
            </div>
          </Reveal>
        )}

        {!isDigital && !confirmed && (
          <Reveal kind="up" delay={40}>
            <p className="mt-8 text-[0.95rem] leading-relaxed text-ink-soft">
              {receiptOk && (
                <>
                  Booking reference:{' '}
                  <code className="rounded bg-paper-deep px-2 py-1 font-mono text-[0.8rem] text-ink">
                    {booking.id}
                  </code>
                  <br />
                </>
              )}
              Questions about a booking? Email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="link-underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Reveal>
        )}

        <Reveal kind="up" delay={60}>
          <div className="mt-10 flex flex-col items-center gap-4">
            {isDigital && service?.fileUrl && (
              <Button href={service.fileUrl} variant="solid" size="lg" className="mb-4">
                Download Now
              </Button>
            )}
            <Button href="/" variant={isDigital && service?.fileUrl ? 'outline' : 'solid'} size="lg">
              Return Home
            </Button>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
