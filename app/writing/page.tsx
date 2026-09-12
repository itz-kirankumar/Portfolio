import { Metadata } from 'next'
import Link from 'next/link'
import { SiteFooter, SiteNav, UtilityBar } from '@/components/site/Chrome'
import { getCachedSiteContent } from '@/lib/site'
import { Section, SectionHead } from '@/components/ui/primitives'
import { safeList } from '@/lib/store'
import { POSTS_COLLECTION, postSchema } from '@/lib/schemas/post'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getCachedSiteContent()
  const title = `Writing — ${meta.name}`
  return {
    title,
    openGraph: { title },
    twitter: { title },
  }
}

export default async function WritingIndexPage() {
  const content = await getCachedSiteContent()
  const { meta } = content

  const rawPosts = await safeList(POSTS_COLLECTION, postSchema, {
    where: [['status', '==', 'published']],
  })
  const posts = rawPosts.sort((a, b) => (b.publishedAt || b.createdAt) - (a.publishedAt || a.createdAt))

  return (
    <>
      <UtilityBar utility={content.utility} />
      <SiteNav nav={content.nav} resumeUrl={meta.resumeUrl} />

      <main className="min-h-screen">
        <Section tone="paper">
          <SectionHead eyebrow="Writing" heading="Notes & essays" />
          
          <div className="mt-16 max-w-2xl">
            {posts.length > 0 ? (
              <ul className="divide-y divide-rule border-y border-rule">
                {posts.map((post) => {
                  const formattedDate = post.publishedAt > 0 
                    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : ''

                  return (
                    <li key={post.id}>
                      <Link
                        href={`/writing/${post.slug}`}
                        className="group flex flex-col gap-1.5 py-6 transition-opacity hover:opacity-80"
                      >
                        {formattedDate ? (
                          <span className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-ink-soft">
                            {formattedDate}
                          </span>
                        ) : null}
                        
                        <span className="font-display text-xl font-medium leading-snug tracking-[-0.015em] text-ink">
                          {post.title}
                          <span aria-hidden="true" className="ml-2 inline-block text-coral transition-transform group-hover:translate-x-1">
                            →
                          </span>
                        </span>
                        
                        {post.excerpt ? (
                          <span className="text-[1.05rem] leading-relaxed text-ink-soft">
                            {post.excerpt}
                          </span>
                        ) : null}

                        <div className="mt-2 flex items-center gap-2 font-mono text-[0.75rem] text-ink-soft/70">
                          <span>{post.readingMinutes} min read</span>
                          {post.tags.length > 0 && (
                            <>
                              <span>·</span>
                              <span className="truncate">{post.tags.join(', ')}</span>
                            </>
                          )}
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="rounded-lg border border-dashed border-rule px-6 py-10">
                <p className="font-hand text-2xl leading-snug text-ink-soft">
                  No posts published yet.
                </p>
              </div>
            )}
          </div>
        </Section>
      </main>

      <SiteFooter footer={content.footer} meta={meta} />
    </>
  )
}
