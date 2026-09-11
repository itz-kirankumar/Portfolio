import Link from 'next/link'
import { LayoutTemplate } from 'lucide-react'
import { PageHeader, Panel } from '@/components/admin/ui'
import { SECTION_META } from '@/lib/site-schema'

export const metadata = { title: 'Site sections' }

export default function SiteSectionsPage() {
  return (
    <>
      <PageHeader
        title="Site sections"
        description="Every block on the homepage. Edit the content, rearrange the order, or hide sections you don't need."
      />

      <Panel className="p-0 sm:p-0">
        <ul className="divide-y divide-rule/70">
          {SECTION_META.map((section) => (
            <li key={section.key}>
              <Link
                href={`/admin/${section.key}`}
                className="flex items-center gap-4 px-4 py-4 transition hover:bg-paper-deep/40 sm:px-6"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-rule bg-card text-ink-soft">
                  <LayoutTemplate className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.95rem] font-medium text-ink">{section.label}</p>
                  <p className="truncate text-[0.85rem] text-ink-soft">{section.hint}</p>
                </div>
                <div className="shrink-0 text-[0.8rem] font-medium text-coral-ink">
                  Edit &rarr;
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  )
}
