import { safeList } from '@/lib/store'
import { SUBSCRIBERS_COLLECTION, subscriberSchema } from '@/lib/schemas/subscriber'
import { Users } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/admin/ui'
import { Button } from '@/components/ui/primitives'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Newsletter' }

export default async function NewsletterPage() {
  const subscribers = await safeList(SUBSCRIBERS_COLLECTION, subscriberSchema, {
    orderBy: ['createdAt', 'desc']
  })

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Newsletter"
          description="Manage your newsletter subscribers."
        />
        <Button href="/admin/newsletter/compose" className="w-fit" variant="solid" size="md">
          Compose Email
        </Button>
      </div>

      {subscribers.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<Users className="size-6 text-ink-soft" />}
            title="No subscribers yet"
            description="When people subscribe to your newsletter, they will appear here."
          />
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-rule bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-rule bg-paper-deep/50">
                  <th className="py-3 px-5 text-[0.7rem] font-mono font-medium text-ink-soft uppercase tracking-[0.13em]">Email</th>
                  <th className="py-3 px-5 text-[0.7rem] font-mono font-medium text-ink-soft uppercase tracking-[0.13em]">Name</th>
                  <th className="py-3 px-5 text-[0.7rem] font-mono font-medium text-ink-soft uppercase tracking-[0.13em]">Status</th>
                  <th className="py-3 px-5 text-[0.7rem] font-mono font-medium text-ink-soft uppercase tracking-[0.13em]">Source</th>
                  <th className="py-3 px-5 text-[0.7rem] font-mono font-medium text-ink-soft uppercase tracking-[0.13em]">Subscribed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="transition hover:bg-paper-deep/50">
                    <td className="py-3 px-5 text-[0.95rem] font-medium text-ink">{sub.email}</td>
                    <td className="py-3 px-5 text-[0.95rem] text-ink-soft">{sub.name || '—'}</td>
                    <td className="py-3 px-5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.7rem] uppercase tracking-wider font-mono ${
                        sub.status === 'active' ? 'bg-coral-soft/50 text-coral-ink' : 'bg-rule text-ink-soft'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-[0.82rem] text-ink-soft">{sub.source || 'unknown'}</td>
                    <td className="py-3 px-5 text-[0.82rem] text-ink-soft whitespace-nowrap">
                      {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('en-GB') : 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
