import { notFound } from 'next/navigation'
import { safeGet } from '@/lib/store'
import { PAGES_COLLECTION, pageSchema } from '@/lib/schemas/page'
import { ClientEditor } from './ClientEditor'

export const dynamic = 'force-dynamic'

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  let initialData: any = {
    title: '',
    slug: '',
    html: '',
    doc: '',
    status: 'draft',
  }

  if (id !== 'new') {
    const doc = await safeGet(PAGES_COLLECTION, id, pageSchema)
    if (!doc) notFound()
    initialData = doc
  }

  return <ClientEditor id={id} initialData={initialData} />
}
