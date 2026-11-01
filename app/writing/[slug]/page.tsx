// Public article page. Statically rendered and cached (ISR): no Dynamic API
// reads here - the owner preview lives behind /preview/writing/[slug], reached
// from the unchanged /writing/<slug>?preview=true URL via a config rewrite.
// generateStaticParams returning [] keeps any slug generable on demand; the
// first hit renders, later hits serve the cache until revalidate or an
// on-demand revalidatePath from a publish/edit/like/comment action.
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCachedSiteContent } from '@/lib/site'
import { safeList, safeGet } from '@/lib/store'
import { POSTS_COLLECTION, postSchema } from '@/lib/schemas/post'
import { COMMENTS_COLLECTION, commentSchema } from '@/lib/schemas/comment'
import { ArticleView, buildArticleMetadata, pickRelated } from '@/components/site/ArticleView'

export const revalidate = 3600

export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return buildArticleMetadata(slug)
}

export default async function WritingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const post = await safeGet(POSTS_COLLECTION, slug, postSchema)
  if (!post || post.status !== 'published') {
    notFound()
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
      isPreview={false}
    />
  )
}
