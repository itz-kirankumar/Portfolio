import { Metadata } from 'next'
import { SiteFooter, SiteNav, UtilityBar } from '@/components/site/Chrome'
import { getCachedSiteContent } from '@/lib/site'
import { Section } from '@/components/ui/primitives'
import { safeList } from '@/lib/store'
import { POSTS_COLLECTION, postSchema } from '@/lib/schemas/post'
import { WritingIndex, type WritingIndexPost } from '@/components/site/WritingIndex'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const { meta, writing } = await getCachedSiteContent()
  const title = `${writing.heading || 'Writing'} — ${meta.name}`
  const description = writing.intro || `Articles and notes by ${meta.name}.`
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  }
}

// Formatted once on the server; the client receives plain strings so it never
// has to touch Intl (which would read the browser timezone and mismatch SSR).
const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export default async function WritingIndexPage() {
  const content = await getCachedSiteContent()
  const { meta } = content

  const rawPosts = await safeList(POSTS_COLLECTION, postSchema, {
    where: [['status', '==', 'published']],
  })

  const posts: WritingIndexPost[] = rawPosts
    .sort((a, b) => (b.publishedAt || b.createdAt) - (a.publishedAt || a.createdAt))
    .map((p) => {
      const ts = p.publishedAt || p.createdAt || 0
      const d = ts > 0 ? new Date(ts) : null
      return {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        coverUrl: p.coverUrl,
        tags: p.tags,
        readingMinutes: Math.max(1, p.readingMinutes),
        dateLabel: d ? dateFmt.format(d) : '',
        year: d ? d.getFullYear() : new Date().getFullYear(),
      }
    })

  return (
    <>
      <UtilityBar utility={content.utility} />
      <SiteNav nav={content.nav} resumeUrl={meta.resumeUrl} />

      <main className="min-h-screen">
        <Section tone="paper" className="paper-grain">
          <WritingIndex
            posts={posts}
            eyebrow={content.writing.eyebrow}
            heading={content.writing.heading}
            intro={content.writing.intro}
          />
        </Section>
      </main>

      <SiteFooter footer={content.footer} meta={meta} />
    </>
  )
}
