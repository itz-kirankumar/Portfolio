import { safeList } from '@/lib/store'
import { PAGES_COLLECTION, pageSchema } from '@/lib/schemas/page'
import Link from 'next/link'
import { Plus, LayoutTemplate } from 'lucide-react'
import { PageHeader, EmptyState, BTN_PRIMARY } from '@/components/admin/ui'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Custom Pages' }

export default async function CustomPagesAdmin() {
  const pages = await safeList(PAGES_COLLECTION, pageSchema, {
    orderBy: ['updatedAt', 'desc']
  })

  return (
    <>
      <PageHeader
        title="Custom Pages"
        description="Create standalone pages and link them in your Navigation."
        actions={
          <Link href="/admin/pages/new" className={BTN_PRIMARY}>
            <Plus className="size-3.5" />
            New Page
          </Link>
        }
      />

      {pages.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<LayoutTemplate className="size-6 text-ink-soft" />}
            title="No custom pages"
            description="Create a standalone page like 'About' or 'Terms'."
            action={
              <Link href="/admin/pages/new" className={BTN_PRIMARY}>
                Create a page
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-rule bg-card shadow-sm">
          <ul className="divide-y divide-rule">
            {pages.map((p) => (
              <li key={p.id} className="transition hover:bg-paper-deep/50">
                <Link href={`/admin/pages/${p.id}`} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[0.95rem] text-ink truncate">
                      {p.title || 'Untitled Page'}
                    </p>
                    <p className="mt-1 text-[0.82rem] font-mono text-ink-soft truncate">
                      /{p.slug || p.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[0.7rem] uppercase tracking-wider font-mono ${
                      p.status === 'published' ? 'bg-coral-soft/50 text-coral-ink' :
                      'bg-rule text-ink-soft'
                    }`}>
                      {p.status}
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
