import { notFound, redirect } from 'next/navigation'
import { safeGet } from '@/lib/store'
import { BOOKINGS_COLLECTION, bookingSchema } from '@/lib/schemas/booking'
import { SERVICES_COLLECTION, serviceSchema } from '@/lib/schemas/service'
import { getCachedSiteContent } from '@/lib/site'
import { UtilityBar, SiteNav, SiteFooter } from '@/components/site/Chrome'
import { Section, NotebookCard, SectionHead } from '@/components/ui/primitives'
import Razorpay from 'razorpay'
import { RazorpayClient } from '../../RazorpayClient'
import { getAdminDb } from '@/lib/admin'

export default async function CheckoutPage({ 
  params 
}: { 
  params: Promise<{ slug: string; bookingId: string }> 
}) {
  const { slug, bookingId } = await params
  
  const booking = await safeGet(BOOKINGS_COLLECTION, bookingId, bookingSchema)
  if (!booking || booking.status !== 'pending') {
    notFound()
  }

  const service = await safeGet(SERVICES_COLLECTION, slug, serviceSchema)
  if (!service || !service.active || service.paymentMode !== 'razorpay') {
    notFound()
  }

  const content = await getCachedSiteContent()
  const meta = content.meta

  let orderId = booking.payment?.orderId

  if (!orderId) {
    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const key_secret = process.env.RAZORPAY_KEY_SECRET

    if (!key_id || !key_secret) {
      throw new Error('Razorpay keys not configured')
    }

    const razorpay = new Razorpay({ key_id, key_secret })

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

  return (
    <>
      <UtilityBar utility={content.utility} />
      <SiteNav nav={content.nav} resumeUrl={meta.resumeUrl} />
      
      <main className="min-h-[80vh] flex flex-col justify-center bg-paper">
        <Section tone="paper">
          <div className="mx-auto max-w-xl text-center">
            <NotebookCard>
              <SectionHead
                align="center"
                heading="Complete your booking"
                intro={`You are booking ${service.title} for ${new Date(booking.startISO).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`}
              />
              
              <div className="mt-8 border-t border-rule pt-8">
                <RazorpayClient
                  orderId={orderId}
                  amount={service.priceInPaise}
                  currency={service.currency}
                  name={meta.name}
                  email={booking.email}
                  contactName={booking.name}
                  slug={slug}
                  bookingId={bookingId}
                  razorpayKeyId={process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!}
                />
              </div>
            </NotebookCard>
          </div>
        </Section>
      </main>

      <SiteFooter footer={content.footer} meta={meta} />
    </>
  )
}