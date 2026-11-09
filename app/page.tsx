// app/page.tsx
//
// The portfolio. Statically prerendered and revalidated hourly; the admin's
// Server Action busts it immediately via revalidateTag/revalidatePath.
//
// This page must never call getServerSession() â€” that reads cookies(), which
// would make the whole route dynamic and throw away the prerender.

import type { Metadata } from 'next'
import { safeList } from '@/lib/store'
import { POSTS_COLLECTION, postSchema } from '@/lib/schemas/post'
import { SERVICES_COLLECTION, serviceSchema } from '@/lib/schemas/service'
import { SiteFooter, SiteNav } from '@/components/site/Chrome'
import { Hero } from '@/components/site/Hero'
import { FlowWall, type FlowPost } from '@/components/site/Flow'
import { getWorks } from '@/lib/works'
import { getTickItems } from '@/lib/ticker'

import { ServicesList } from '@/components/site/ServicesList'
import { Section, SectionHead } from '@/components/ui/primitives'
import { Closing, OneCard, Writing } from '@/components/site/Voice'
import { getCachedSiteContent } from '@/lib/site'
import { getCachedTheme } from '@/lib/theme'

export const revalidate = 3600

const articleDateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export async function generateMetadata(): Promise<Metadata> {
  const { meta, hero } = await getCachedSiteContent()
  const title = `${meta.name}`
  const description = hero.subhead.slice(0, 200)

  return {
    title: { absolute: title },
    description,
    openGraph: { title, description },
    twitter: { title, description },
  }
}


export default async function HomePage() {
  const [content, theme, allPosts, allServices, allWorks] = await Promise.all([
    getCachedSiteContent(),
    getCachedTheme(),
    safeList(POSTS_COLLECTION, postSchema),
    safeList(SERVICES_COLLECTION, serviceSchema),
    getWorks(),
  ])
  const { meta } = content

  // Override static posts with real ones
  const publishedPosts = allPosts
    .filter(p => p.status === 'published')
    .sort((a, b) => (b.publishedAt || b.createdAt) - (a.publishedAt || a.createdAt))
    .slice(0, 3)
    .map(p => ({
      title: p.title,
      blurb: p.excerpt,
      href: `/writing/${p.slug}`,
      date: p.publishedAt || p.createdAt
        ? articleDateFormat.format(new Date(p.publishedAt || p.createdAt))
        : '',
    }))

  if (publishedPosts.length > 0) {
    content.writing.posts = publishedPosts
  }

  // Active services
  const activeServices = allServices
    .filter(s => s.active)
    .sort((a, b) => a.order - b.order)

  // The flowing wall: latest published writing + all works + a ticker of
  // everything in motion. Fed automatically — new posts and works appear on
  // the next revalidate.
  const flowPosts: FlowPost[] = allPosts
    .filter(p => p.status === 'published')
    .sort((a, b) => (b.publishedAt || b.createdAt) - (a.publishedAt || a.createdAt))
    .slice(0, 10)
    .map(p => ({
      title: p.title,
      href: `/writing/${p.slug}`,
      date: p.publishedAt || p.createdAt
        ? articleDateFormat.format(new Date(p.publishedAt || p.createdAt))
        : '',
      coverUrl: p.coverUrl || '',
    }))

  const tickItems = await getTickItems()


  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: meta.name,
    description: meta.descriptor,
    email: meta.email ? `mailto:${meta.email}` : undefined,
    telephone: meta.phone || undefined,
    url: process.env.NEXT_PUBLIC_SITE_URL || undefined,
    image: content.hero.portrait.src || undefined,
    sameAs: [meta.linkedin].filter(Boolean),
    address: meta.location ? { '@type': 'PostalAddress', addressLocality: meta.location } : undefined,
    jobTitle: 'Founder & Product Strategy',
    knowsAbout: [
      'Go-to-market strategy',
      'Product management',
      'Unit economics',
      'Growth and retention',
      'AI product development',
    ],
    alumniOf: [
      { '@type': 'CollegeOrUniversity', name: "Masters' Union" },
      { '@type': 'CollegeOrUniversity', name: 'Bannari Amman Institute of Technology' },
    ],
  }

  const isVisible = (key: string) => {
    const section = theme.sections?.find(s => s.key === key)
    return section ? section.visible : true
  }

  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify output is escaped for the </script> case below.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <SiteNav nav={content.nav} resumeUrl={meta.resumeUrl} showThemeToggle={theme.darkMode === 'toggle'} tickItems={tickItems} />

      <main>
        {isVisible('hero') && <Hero hero={content.hero} meta={meta} layout={theme.heroLayout} />}
        <FlowWall works={allWorks} posts={flowPosts} />
        {activeServices.length > 0 && isVisible('services') && (
          <Section id="services" tone="deep" compact>
            <SectionHead 
              eyebrow="Offerings" 
              heading="Ways we can work together" 
              intro="Select a service to book a slot directly." 
            />
            <ServicesList services={activeServices} />
          </Section>
        )}

        {isVisible('writing') && <Writing writing={content.writing} />}
        {isVisible('oneCard') && <OneCard oneCard={content.oneCard} />}
        {isVisible('closing') && <Closing closing={content.closing} meta={meta} />}
      </main>

      <SiteFooter footer={content.footer} meta={meta} />
    </>
  )
}
