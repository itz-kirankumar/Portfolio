import { safeList } from '@/lib/store'
import { WORKS_COLLECTION, workSchema, KIND_LABEL, STATUS_LABEL } from '@/lib/schemas/work'
import { PageHeader, EmptyState, BTN_PRIMARY } from '@/components/admin/ui'
import Link from 'next/link'
import { Plus, Rocket } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Works' }

export default async function WorksPage() {
  const works = await safeList(WORKS_COLLECTION, workSchema, {
    orderBy: ['order', 'asc'],
  })

  return (
    <>
      <PageHeader
        title="Works"
        description="Everything on the wall and /work — projects, ventures, tools, research. New works appear on the homepage automatically."
        actions={
          <Link href="/admin/works/new" className={BTN_PRIMARY}>
            <Plus className="size-3.5" />
            Add Work
          </Link>
        }
      />
      {works.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<Rocket className="size-6 text-ink-soft" />}
            title="No works in the collection yet"
            description="The wall is showing the built-in seed for now. Add your first work here and the collection takes over."
            action={
              <Link href="/admin/works/new" className={BTN_PRIMARY}>
                Add Work
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-rule bg-card shadow-sm">
          <ul className="divide-y divide-rule">
            {works.map((work) => (
              <li key={work.id} className="transition hover:bg-paper-deep/50">
                <Link href={`/admin/works/${work.id}`} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-[0.95rem] text-ink">{work.title}</p>
                      {work.featured && (
                        <span className="rounded bg-coral-soft px-1.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider text-coral-ink">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[0.82rem] text-ink-soft">
                      {KIND_LABEL[work.kind]} &middot; {STATUS_LABEL[work.status]}
                      {work.period ? ` · ${work.period}` : ''}
                    </p>
                  </div>
                  <div className="font-mono text-[0.82rem] uppercase tracking-wider text-ink-soft">
                    /work/{work.slug}
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
