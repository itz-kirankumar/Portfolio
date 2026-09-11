import { safeGet } from '@/lib/store'
import { POSTS_COLLECTION, postSchema } from '@/lib/schemas/post'
import ClientEditor from './ClientEditor'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/admin/ui'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'new'
  let initialData = {}
  
  if (!isNew) {
    const post = await safeGet(POSTS_COLLECTION, id, postSchema)
    if (!post) {
      notFound()
    }
    initialData = post
  }

  return (
    <>
      <PageHeader
        title={isNew ? 'New post' : 'Edit post'}
        description={isNew ? 'Write a new blog post or newsletter.' : 'Update the content and publishing settings.'}
      />
      <ClientEditor initialData={initialData} id={id} />
    </>
  )
}
