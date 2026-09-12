import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { SiteFooter, SiteNav, UtilityBar } from '@/components/site/Chrome'
import { getCachedSiteContent } from '@/lib/site'
import { RuleDivider, Eyebrow } from '@/components/ui/primitives'
import { safeList, safeGet } from '@/lib/store'
import { POSTS_COLLECTION, postSchema } from '@/lib/schemas/post'
import { COMMENTS_COLLECTION, commentSchema } from '@/lib/schemas/comment'
import { CommentsList } from '@/components/site/CommentsList'
import { cookies } from 'next/headers'
import { ArticleActions } from '@/components/site/ArticleActions'

export const revalidate = 3600

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Omit<Props, 'searchParams'>): Promise<Metadata> {
  const { slug } = await params
  const post = await safeGet(POSTS_COLLECTION, slug, postSchema)
  
  if (!post) return {}
  
  const { meta } = await getCachedSiteContent()
  const title = `${post.title} - ${meta.name}`
  
  return {
    title,
    description: post.excerpt,
    openGraph: { 
      title, 
      description: post.excerpt, 
      images: post.coverUrl ? [post.coverUrl] : [] 
    },
    twitter: { 
      title, 
      description: post.excerpt, 
      images: post.coverUrl ? [post.coverUrl] : [] 
    },
  }
}

export default async function WritingDetailPage({ params, searchParams }: Props) {
  const { slug } = await params
  const search = await searchParams
  const isPreview = search.preview === 'true'
  
  const post = await safeGet(POSTS_COLLECTION, slug, postSchema)

  let isAllowed = false
  if (post?.status === 'published') isAllowed = true
  if (post && isPreview) {
    const session = (await cookies()).get('__session')
    if (session) isAllowed = true
  }

  if (!isAllowed || !post) {
    notFound()
  }

  const content = await getCachedSiteContent()
  const { meta } = content

  const rawComments = await safeList(COMMENTS_COLLECTION, commentSchema, {
    where: [['postId', '==', slug], ['status', '==', 'approved']],
  })
  const comments = rawComments.sort((a, b) => b.createdAt - a.createdAt)

  const displayDate = post.publishedAt > 0 ? post.publishedAt : post.createdAt
  const formattedDate = displayDate > 0 
    ? new Date(displayDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : isPreview ? 'Preview Mode' : ''

  return (
    <>
      <UtilityBar utility={content.utility} />
      <SiteNav nav={content.nav} resumeUrl={meta.resumeUrl} />

      <main className="min-h-screen bg-paper pb-16 lg:pb-32">
        <article>
          {post.coverUrl ? (
            <header className="relative w-full h-[70vh] min-h-[500px] flex flex-col justify-end">
              <div className="absolute inset-0">
                <Image
                  src={post.coverUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>
              <div className="relative mx-auto w-full max-w-7xl px-6 pb-16 lg:px-8">
                <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.02em] text-white text-balance drop-shadow-sm max-w-4xl">
                  {post.title}
                </h1>
              </div>
            </header>
          ) : (
            <header className="mx-auto max-w-7xl px-6 pt-24 pb-12 lg:px-8 lg:pt-32">
              <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.02em] text-ink text-balance max-w-4xl">
                {post.title}
              </h1>
              <RuleDivider className="mt-12" />
            </header>
          )}

          <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_2.5fr] items-start">
            
            {/* Left Sidebar Metadata */}
            <aside className="lg:sticky lg:top-32 space-y-8 order-2 lg:order-1 border-t border-rule lg:border-t-0 pt-8 lg:pt-0">
              <div>
                <Eyebrow tone="ink" className="mb-4 block">Writing</Eyebrow>
                {formattedDate && (
                  <time 
                    className="block font-mono text-[0.75rem] uppercase tracking-[0.15em] text-ink-soft mb-6" 
                    dateTime={new Date(displayDate).toISOString()}
                  >
                    {formattedDate}
                  </time>
                )}
                
                {post.excerpt && (
                  <p className="text-[1.1rem] leading-relaxed text-ink-soft mb-6 text-pretty font-medium">
                    {post.excerpt}
                  </p>
                )}

                <div className="flex flex-col gap-2 font-mono text-[0.8rem] text-ink-soft pt-6 border-t border-rule/50">
                  <span>{post.readingMinutes} min read</span>
                  {post.tags.length > 0 && (
                    <span className="mt-2">{post.tags.join(', ')}</span>
                  )}
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="order-1 lg:order-2">
              <div 
                className="prose prose-stone prose-lg md:prose-xl max-w-none text-ink prose-headings:font-display prose-headings:font-bold prose-p:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.html }} 
              />
              
              <div className="mt-24">
                <RuleDivider />
                <ArticleActions title={post.title} slug={post.slug} initialLikes={post.likes || 0} />
                <CommentsList postId={post.slug} initialComments={comments} />
              </div>
            </div>

          </div>
        </article>
      </main>

      <SiteFooter footer={content.footer} meta={meta} />
    </>
  )
}