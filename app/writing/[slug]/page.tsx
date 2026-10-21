import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteFooter, SiteNav, UtilityBar } from '@/components/site/Chrome'
import { getCachedSiteContent } from '@/lib/site'
import { RuleDivider, Eyebrow } from '@/components/ui/primitives'
import { safeList, safeGet } from '@/lib/store'
import { POSTS_COLLECTION, postSchema, type Post } from '@/lib/schemas/post'
import { COMMENTS_COLLECTION, commentSchema } from '@/lib/schemas/comment'
import { CommentsList } from '@/components/site/CommentsList'
import { cookies } from 'next/headers'
import { ArticleActions } from '@/components/site/ArticleActions'
import { ReadingProgress } from '@/components/site/ReadingProgress'
import { BackToTop } from '@/components/site/BackToTop'
import { normalizeTags } from '@/lib/tags'

export const revalidate = 3600

/** Up to `limit` other published posts, ranked by shared tags then recency. */
function pickRelated(all: Post[], current: Post, limit = 3): Post[] {
  const currentTags = new Set(current.tags)
  return all
    .filter((p) => p.slug !== current.slug && p.status === 'published')
    .map((p) => ({ p, shared: p.tags.filter((t) => currentTags.has(t)).length }))
    .sort(
      (a, b) =>
        b.shared - a.shared ||
        (b.p.publishedAt || b.p.createdAt) - (a.p.publishedAt || a.p.createdAt)
    )
    .slice(0, limit)
    .map((x) => x.p)
}

const relatedDateFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

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
  
  const ogUrl = new URL('/api/og', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
  ogUrl.searchParams.set('title', post.title)
  if (post.coverUrl) {
    ogUrl.searchParams.set('cover', post.coverUrl)
  }

  return {
    title,
    description: post.excerpt,
    openGraph: { 
      title, 
      description: post.excerpt, 
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
        }
      ]
    },
    twitter: { 
      card: 'summary_large_image',
      title, 
      description: post.excerpt, 
      images: [ogUrl.toString()] 
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

  const allPublished = await safeList(POSTS_COLLECTION, postSchema, {
    where: [['status', '==', 'published']],
  })
  const related = pickRelated(allPublished, post, 3)

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
      <ReadingProgress />

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

          <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-10">
            <Link
              href="/writing"
              className="link-underline inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink-soft hover:text-ink"
            >
              <span aria-hidden="true">←</span> All writing
            </Link>
          </div>

          <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-8 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_2.5fr] items-start">
            
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
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {normalizeTags(post.tags).map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center rounded-md bg-paper-deep px-2 py-0.5 font-mono text-[0.7rem] text-ink-soft ring-1 ring-rule/60"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="order-1 lg:order-2">
              <div
                className="prose prose-stone prose-lg md:prose-xl max-w-[72ch] text-ink prose-headings:font-display prose-headings:font-bold prose-p:leading-relaxed"
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

        {related.length > 0 ? (
          <section className="mx-auto max-w-7xl px-6 lg:px-8 mt-24 lg:mt-32">
            <RuleDivider className="mb-12" />
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-coral-ink">
              Keep reading
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.6rem,3vw,2.2rem)] font-semibold tracking-[-0.02em] text-ink">
              More field notes
            </h2>
            <ul className="mt-10 grid gap-x-10 gap-y-10 border-t border-rule pt-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => {
                const ts = r.publishedAt || r.createdAt || 0
                const dateLabel = ts > 0 ? relatedDateFmt.format(new Date(ts)) : ''
                return (
                  <li key={r.slug}>
                    <Link
                      href={`/writing/${r.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <div className="flex flex-wrap items-center gap-x-2.5 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ink-soft">
                        {dateLabel ? <span>{dateLabel}</span> : null}
                        {dateLabel ? (
                          <span aria-hidden="true" className="text-rule">
                            /
                          </span>
                        ) : null}
                        <span>{r.readingMinutes} min read</span>
                      </div>
                      <h3 className="mt-2 font-display text-[1.15rem] font-medium leading-snug tracking-[-0.015em] text-ink">
                        {r.title}
                        <span className="sr-only"> (opens in a new tab)</span>
                        <span
                          aria-hidden="true"
                          className="ml-1.5 inline-block text-coral transition-transform duration-300 group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </h3>
                      {r.excerpt ? (
                        <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft line-clamp-2">
                          {r.excerpt}
                        </p>
                      ) : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ) : null}
      </main>

      <BackToTop />
      <SiteFooter footer={content.footer} meta={meta} />
    </>
  )
}