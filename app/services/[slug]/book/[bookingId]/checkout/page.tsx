import { notFound } from 'next/navigation'
import { safeGet } from '@/lib/store'
import { BOOKINGS_COLLECTION, bookingSchema } from '@/lib/schemas/booking'
import { SERVICES_COLLECTION, serviceSchema } from '@/lib/schemas/service'
import { Section, NotebookCard, SectionHead } from '@/components/ui/primitives'
import Razorpay from 'razorpay'
import { RazorpayClient } from '../../RazorpayClient'
import { getAdminDb } from '@/lib/admin'
import { hasCalendarWriteScope } from '@/lib/calendar-scope'
import { getCachedSiteContent } from '@/lib/site'

export default async function CheckoutPage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ slug: string; bookingId: string }>
  searchParams: Promise<{ k?: string }>
}) {
  const { slug, bookingId } = await params
  const { k } = await searchParams
  
  const booking = await safeGet(BOOKINGS_COLLECTION, bookingId, bookingSchema)
  if (!booking || booking.status !== 'pending') {
    notFound()
  }

  // The booking id is deterministic, and this page hands the guest's name and
  // email to the Razorpay prefill - so the URL must present the unguessable
  // receipt token minted at booking time. Fail closed for every booking,
  // including token-less legacy ones: a guessed id must show nothing.
  if (!booking.receiptToken || booking.receiptToken !== k) {
    notFound()
  }

  const service = await safeGet(SERVICES_COLLECTION, slug, serviceSchema)
  if (!service || !service.active || service.paymentMode !== 'razorpay') {
    notFound()
  }

  const content = await getCachedSiteContent()
  let orderId = booking.payment?.orderId

  const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET
  const paymentsReady = Boolean(key_id && key_secret)

  // Chrome (nav, footer) comes from app/services/layout.tsx - rendering it
  // here as well produced a duplicated header and footer on this page.

  // Keys land after the owner connects Razorpay. Until then the booking stays
  // pending and the visitor gets an honest note instead of a 500.
  if (!paymentsReady) {
    return (
      <Section tone="paper">
        <div className="mx-auto max-w-xl text-center">
          <NotebookCard>
            <SectionHead
              align="center"
              heading="Payment is being connected"
              intro={`Your ${service.title} slot request is saved. Online payment goes live here shortly; check back in a bit, or reach out directly and we'll sort it manually.`}
            />
          </NotebookCard>
        </div>
      </Section>
    )
  }

  // Do not collect payment while the calendar connection cannot create the
  // promised Meet invite. The pending booking stays untouched and recoverable.
  if (!service.bookingOpen || !(await hasCalendarWriteScope())) {
    return (
      <Section tone="paper">
        <div className="mx-auto max-w-xl text-center">
          <NotebookCard>
            <SectionHead
              align="center"
              heading="Payment opens soon"
              intro={`Your ${service.title} slot request is saved. Online payment opens soon while the session details are being finalised - no payment is taken until then. This link keeps working, so please check back shortly.`}
            />
          </NotebookCard>
        </div>
      </Section>
    )
  }

  if (!orderId) {
    const razorpay = new Razorpay({ key_id: key_id!, key_secret: key_secret! })

    const order = await razorpay.orders.create({
      amount: service.priceInPaise,
      currency: service.currency,
      receipt: booking.id,
    })

    orderId = order.id

    // Save orderId to booking
    const db = getAdminDb()
    await db.collection(BOOKINGS_COLLECTION).doc(bookingId).update({
      'payment.orderId': orderId
    })
  }

  const slotLabel = new Date(booking.startISO).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: booking.tz || 'Asia/Kolkata',
  })

  return (
    <Section tone="paper">
      <div className="mx-auto max-w-xl text-center">
        <NotebookCard>
          <SectionHead
            align="center"
            heading="Complete your booking"
            intro={`You are booking ${service.title} for ${slotLabel} (${booking.tz || 'Asia/Kolkata'})`}
          />
          
          <p className="mt-6 text-xs leading-relaxed text-ink-soft">
            You can reschedule your call once. Refunds are not available. To reschedule, email <a href="mailto:kiran.kumar2028@mastersunion.org" className="link-underline">kiran.kumar2028@mastersunion.org</a>.
          </p>

          <div className="mt-8 border-t border-rule pt-8">
            <RazorpayClient
              orderId={orderId}
              amount={service.priceInPaise}
              currency={service.currency}
              name={content.meta.name}
              email={booking.email}
              contactName={booking.name}
              slug={slug}
              bookingId={bookingId}
              receiptToken={booking.receiptToken || ''}
              razorpayKeyId={process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!}
            />
          </div>
        </NotebookCard>
      </div>
    </Section>
  )
}
