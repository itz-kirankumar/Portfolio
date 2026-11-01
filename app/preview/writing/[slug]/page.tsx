// Owner preview of an article, including drafts. Reached from the unchanged
// /writing/<slug>?preview=true URL via the rewrite in next.config.ts, so the
// address bar and every existing preview link stay exactly as they were.
// Always dynamic. Published posts render for anyone (as before); drafts now
// require a verified owner session instead of the mere presence of a cookie.
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCachedSiteContent } from '@/lib/site'
import { safeList, safeGet } from '@/lib/store'
import { POSTS_COLLECTION, postSchema } from '@/lib/schemas/post'
import { COMMENTS_COLLECTION, commentSchema } from '@/lib/schemas/comment'
import { ArticleView, buildArticleMetadata, pickRelated } from '@/components/site/ArticleView'
import { getOwnerSession } from '@/lib/guard'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return buildArticleMetadata(slug)
}

export default async function WritingPreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const post = await safeGet(POSTS_COLLECTION, slug, postSchema)
  if (!post) {
    notFound()
  }

  if (post.status !== 'published') {
    const session = await getOwnerSession()
    if (!session) {
      notFound()
    }
  }

  const content = await getCachedSiteContent()

  const rawComments = await safeList(COMMENTS_COLLECTION, commentSchema, {
    where: [['postId', '==', slug], ['status', '==', 'approved']],
  })
  const comments = rawComments.sort((a, b) => b.createdAt - a.createdAt)

  const allPublished = await safeList(POSTS_COLLECTION, postSchema, {
    where: [['status', '==', 'published']],
  })
  const related = pickRelated(allPublished, post, 3)

  return (
    <ArticleView
      post={post}
      comments={comments}
      related={related}
      content={content}
      isPreview={true}
    />
  )
}
