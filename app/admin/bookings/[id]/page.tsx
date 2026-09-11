import { safeGet } from '@/lib/store'
import { BOOKINGS_COLLECTION, bookingSchema } from '@/lib/schemas/booking'
import BookingEditor from './BookingEditor'
import { PageHeader } from '@/components/admin/ui'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const metadata = { title: 'Booking Details' }

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const data = await safeGet(BOOKINGS_COLLECTION, decodeURIComponent(id), bookingSchema)
  if (!data) {
    notFound()
  }

  return (
    <>
      <div className="mb-6">
        <Link href="/admin/bookings" className="text-sm text-stone-500 hover:text-stone-900 mb-2 inline-block">
          &larr; Back to Bookings
        </Link>
        <PageHeader 
          title="Booking Details" 
          description={`Viewing booking for ${data.name}`}
        />
      </div>
      <BookingEditor id={decodeURIComponent(id)} initialData={data} />
    </>
  )
}
