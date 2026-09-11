import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { SiteFooter, SiteNav, UtilityBar } from '@/components/site/Chrome'
import { getCachedSiteContent } from '@/lib/site'
import { RuleDivider, Eyebrow } from '@/components/ui/primitives'
import { safeGet } from '@/lib/store'
import { POSTS_COLLECTION, postSchema } from '@/lib/schemas/post'

export const revalidate = 3600

import { cookies } from 'next/headers'

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

  const formattedDate = post.publishedAt > 0 
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : isPreview ? 'Preview Mode' : ''

  return (
    <>
      <UtilityBar utility={content.utility} />
      <SiteNav nav={content.nav} resumeUrl={meta.resumeUrl} />

      <main className="min-h-screen bg-paper pb-16 pt-16 sm:pb-24 sm:pt-24 lg:pb-32 lg:pt-32">
        <article>
          <header className="mx-auto max-w-2xl px-6 lg:px-8">
            <div className="mb-6 flex items-center gap-3">
              <Eyebrow tone="ink">Writing</Eyebrow>
              {formattedDate && (
                <>
                  <span className="text-ink-soft/40">/</span>
                  <time 
                    className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-ink-soft" 
                    dateTime={new Date(post.publishedAt).toISOString()}
                  >
                    {formattedDate}
                  </time>
                </>
              )}
            </div>
            
            <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-ink">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-6 text-[1.15rem] leading-relaxed text-ink-soft">
                {post.excerpt}
              </p>
            )}

            <div className="mt-8 flex items-center gap-4 font-mono text-[0.8rem] text-ink-soft">
              <span>{post.readingMinutes} min read</span>
              {post.tags.length > 0 && (
                <>
                  <span className="text-ink-soft/40">·</span>
                  <span>{post.tags.join(', ')}</span>
                </>
              )}
            </div>
          </header>

          {post.coverUrl ? (
            <div className="mx-auto mt-12 max-w-5xl px-6 lg:px-8">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-card ring-1 ring-rule shadow-paper">
                <Image
                  src={post.coverUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(min-width: 1024px) 64rem, 100vw"
                />
              </div>
            </div>
          ) : (
            <RuleDivider className="mx-auto mt-12 max-w-2xl px-6 lg:px-8" />
          )}

          <div 
            className="prose prose-stone prose-lg mx-auto mt-12 max-w-2xl px-6 text-ink lg:px-8"
            dangerouslySetInnerHTML={{ __html: post.html }} 
          />
        </article>
      </main>

      <SiteFooter footer={content.footer} meta={meta} />
    </>
  )
}
