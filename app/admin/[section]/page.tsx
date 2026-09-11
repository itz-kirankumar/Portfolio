import { redirect } from 'next/navigation'
import { getSiteContent } from '@/lib/site'
import { isSectionKey, SECTION_META } from '@/lib/site-schema'
import EditorForm from './EditorForm'
import { PageHeader, GHOST_BTN } from '@/components/admin/ui'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  if (!isSectionKey(section)) redirect('/admin')

  const content = await getSiteContent()
  const data = content[section]
  const meta = SECTION_META.find(s => s.key === section)

  return (
    <>
      <div className="mb-2">
        <Link href="/admin/site" className={`${GHOST_BTN} flex items-center gap-1.5 w-fit border-transparent hover:bg-paper-deep`}>
          <ArrowLeft className="size-3.5" /> Back
        </Link>
      </div>
      <PageHeader
        title={`${meta?.label || section}`}
        description={meta?.hint || 'Edit this section of your site.'}
      />
      <EditorForm section={section} initialData={data} />
    </>
  )
}
