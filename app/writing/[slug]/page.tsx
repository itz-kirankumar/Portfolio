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

export const revalidate = 3600

import { cookies } from 'next/headers'
import { ArticleActions } from '@/components/site/ArticleActions'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Omit<Props, 'searchParams'>): Promise<Metadata> {
  const { slug } = await params
  const post = await safeGet(POSTS_COLLECTION, slug, postSchema)
  
  if (!post) return {}
  
  const { meta } = await getCachedSiteContent()
  const title = `${post.title} — ${meta.name}`
  
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

  const comments = await safeList(COMMENTS_COLLECTION, commentSchema, {
    where: [['postId', '==', slug], ['status', '==', 'approved']],
    orderBy: ['createdAt', 'desc']
  })

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
              <div className="relative mx-auto w-full max-w-4xl px-6 pb-16 lg:px-8">
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-mono text-[0.75rem] uppercase tracking-[0.15em] text-white/80">
                    Writing
                  </span>
                  {formattedDate && (
                    <>
                      <span className="text-white/40">/</span>
                      <time 
                        className="font-mono text-[0.75rem] uppercase tracking-[0.15em] text-white/80" 
                        dateTime={new Date(displayDate).toISOString()}
                      >
                        {formattedDate}
                      </time>
                    </>
                  )}
                </div>
                
                <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.02em] text-white text-balance drop-shadow-sm">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="mt-6 text-[1.25rem] leading-relaxed text-white/90 max-w-3xl text-pretty drop-shadow-sm">
                    {post.excerpt}
                  </p>
                )}

                <div className="mt-8 flex items-center gap-4 font-mono text-[0.8rem] text-white/70">
                  <span>{post.readingMinutes} min read</span>
                  {post.tags.length > 0 && (
                    <>
                      <span className="text-white/40">•</span>
                      <span>{post.tags.join(', ')}</span>
                    </>
                  )}
                </div>
              </div>
            </header>
          ) : (
            <header className="mx-auto max-w-4xl px-6 pt-24 pb-12 lg:px-8 lg:pt-32">
              <div className="mb-6 flex items-center gap-3">
                <Eyebrow tone="ink">Writing</Eyebrow>
                {formattedDate && (
                  <>
                    <span className="text-ink-soft/40">/</span>
                    <time 
                      className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-ink-soft" 
                      dateTime={new Date(displayDate).toISOString()}
                    >
                      {formattedDate}
                    </time>
                  </>
                )}
              </div>
              
              <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.02em] text-ink text-balance">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="mt-6 text-[1.25rem] leading-relaxed text-ink-soft max-w-3xl text-pretty">
                  {post.excerpt}
                </p>
              )}

              <div className="mt-8 flex items-center gap-4 font-mono text-[0.8rem] text-ink-soft">
                <span>{post.readingMinutes} min read</span>
                {post.tags.length > 0 && (
                  <>
                    <span className="text-ink-soft/40">•</span>
                    <span>{post.tags.join(', ')}</span>
                  </>
                )}
              </div>
              <RuleDivider className="mt-12" />
            </header>
          )}

          <div 
            className="prose prose-stone prose-lg md:prose-xl mx-auto mt-12 max-w-3xl px-6 text-ink lg:px-8 prose-headings:font-display prose-headings:font-bold prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.html }} 
          />
          
          <div className="mx-auto mt-24 max-w-3xl px-6 lg:px-8">
            <RuleDivider />
            <ArticleActions title={post.title} slug={post.slug} initialLikes={post.likes || 0} />
            <CommentsList postId={post.slug} initialComments={comments} />
          </div>
        </article>
      </main>

      <SiteFooter footer={content.footer} meta={meta} />
    </>
  )
}
