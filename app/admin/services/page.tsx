import { safeList } from '@/lib/store'
import { SERVICES_COLLECTION, serviceSchema } from '@/lib/schemas/service'
import { PageHeader, EmptyState, BTN_PRIMARY } from '@/components/admin/ui'
import Link from 'next/link'
import { Plus, Briefcase } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Services' }

export default async function ServicesPage() {
  const services = await safeList(SERVICES_COLLECTION, serviceSchema, {
    orderBy: ['order', 'asc']
  })

  return (
    <>
      <PageHeader
        title="Services"
        description="Manage your bookable offerings and mentorship packages."
        actions={
          <Link href="/admin/services/new" className={BTN_PRIMARY}>
            <Plus className="size-3.5" />
            Add Service
          </Link>
        }
      />
      {services.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<Briefcase className="size-6 text-ink-soft" />}
            title="No services found"
            description="Create your first service to start taking bookings."
            action={
              <Link href="/admin/services/new" className={BTN_PRIMARY}>
                Add Service
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-rule bg-card shadow-sm">
          <ul className="divide-y divide-rule">
            {services.map((service) => (
              <li key={service.id} className="transition hover:bg-paper-deep/50">
                <Link href={`/admin/services/${service.id}`} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-[0.95rem] text-ink">{service.title}</p>
                      {!service.active && (
                        <span className="rounded bg-paper-deep px-1.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider text-ink-soft">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[0.82rem] text-ink-soft">
                      {service.durationMins} mins · {service.currency} {service.price}
                    </p>
                  </div>
                  <div className="text-[0.82rem] font-mono uppercase tracking-wider text-ink-soft">
                    {service.paymentMode === 'link' ? 'Ext Link' : 'Booking'}
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
