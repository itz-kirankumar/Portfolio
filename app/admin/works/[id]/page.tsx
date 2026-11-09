import { safeGet } from '@/lib/store'
import { WORKS_COLLECTION, workSchema } from '@/lib/schemas/work'
import WorkEditor from './WorkEditor'
import { PageHeader } from '@/components/admin/ui'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const metadata = { title: 'Work Editor' }

export default async function WorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let data = null
  if (id !== 'new') {
    data = await safeGet(WORKS_COLLECTION, id, workSchema)
    if (!data) {
      notFound()
    }
  }

  return (
    <>
      <div className="mb-6">
        <Link href="/admin/works" className="text-sm text-stone-500 hover:text-stone-900 mb-2 inline-block">
          &larr; Back to Works
        </Link>
        <PageHeader
          title={id === 'new' ? 'New Work' : 'Edit Work'}
          description={
            id === 'new'
              ? 'Add a project, venture, tool or experiment to the wall.'
              : `Editing ${data?.title} — live at /work/${data?.slug}`
          }
        />
      </div>
      <WorkEditor id={id} initialData={data} />
    </>
  )
}
