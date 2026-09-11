import { notFound } from 'next/navigation'
import { safeGet } from '@/lib/store'
import { MEDIA_COLLECTION, mediaSchema } from '@/lib/schemas/media'
import MediaEditor from './MediaEditor'
import Link from 'next/link'

export default async function MediaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'new'
  let initialData = {}

  if (!isNew) {
    const doc = await safeGet(MEDIA_COLLECTION, id, mediaSchema)
    if (!doc) notFound()
    initialData = doc
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/media" className="text-sm text-stone-500 hover:text-stone-900 mb-2 inline-block">← Back to Media</Link>
          <h2 className="text-2xl font-bold text-stone-900">{isNew ? 'New Media' : 'Edit Media'}</h2>
          <p className="text-stone-500 mt-1">Upload files or configure embeds.</p>
        </div>
      </div>
      <MediaEditor initialData={initialData} id={isNew ? null : id} />
    </div>
  )
}
