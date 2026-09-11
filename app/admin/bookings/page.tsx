import { safeList } from '@/lib/store'
import { BOOKINGS_COLLECTION, bookingSchema } from '@/lib/schemas/booking'
import { PageHeader, EmptyState } from '@/components/admin/ui'
import Link from 'next/link'
import { CalendarCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Bookings' }

export default async function BookingsPage() {
  const bookings = await safeList(BOOKINGS_COLLECTION, bookingSchema, {
    orderBy: ['createdAt', 'desc']
  })

  return (
    <>
      <PageHeader
        title="Bookings"
        description="Manage your schedule, appointments, and client records."
      />
      {bookings.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<CalendarCheck className="size-6 text-ink-soft" />}
            title="No bookings yet"
            description="When clients book your services, they will appear here."
          />
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-rule bg-card shadow-sm">
          <ul className="divide-y divide-rule">
            {bookings.map((booking) => (
              <li key={booking.id} className="transition hover:bg-paper-deep/50">
                <Link href={`/admin/bookings/${booking.id}`} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[0.95rem] text-ink truncate">
                      {booking.name} <span className="text-ink-soft font-normal ml-1">for {booking.serviceTitle}</span>
                    </p>
                    <p className="mt-1 text-[0.82rem] text-ink-soft truncate">
                      {new Date(booking.startISO).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.7rem] uppercase tracking-wider font-mono ${
                      booking.status === 'confirmed' ? 'bg-coral-soft/50 text-coral-ink' :
                      booking.status === 'cancelled' ? 'bg-rule text-ink-soft' :
                      'bg-blue-100/50 text-blue-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
