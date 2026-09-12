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
import { SiteFooter, SiteNav, UtilityBar } from '@/components/site/Chrome'
import { CredPills, Hero, ProofStrip } from '@/components/site/Hero'
import { Audiences, Projects, Ventures, Ways } from '@/components/site/Work'
import { ServicesList } from '@/components/site/ServicesList'
import { Section, SectionHead } from '@/components/ui/primitives'
import {
  Closing,
  Contrasts,
  Gallery,
  OneCard,
  PointOfView,
  Writing,
} from '@/components/site/Voice'
import { getCachedSiteContent } from '@/lib/site'
import { getCachedTheme } from '@/lib/theme'

export const revalidate = 3600

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

import { MEDIA_COLLECTION, mediaSchema } from '@/lib/schemas/media'
import { DEFAULT_SECTION_ORDER } from '@/lib/schemas/theme'

export default async function HomePage() {
  const [content, theme, allPosts, allServices, allMedia] = await Promise.all([
    getCachedSiteContent(),
    getCachedTheme(),
    safeList(POSTS_COLLECTION, postSchema),
    safeList(SERVICES_COLLECTION, serviceSchema),
    safeList(MEDIA_COLLECTION, mediaSchema)
  ])
  const { meta } = content

  // Override static posts with real ones
  const publishedPosts = allPosts
    .filter(p => p.status === 'published')
    .sort((a, b) => (b.publishedAt || b.createdAt) - (a.publishedAt || a.createdAt))
    .slice(0, 5)
    .map(p => ({
      title: p.title,
      blurb: p.excerpt,
      href: `/writing/${p.slug}`,
      date: new Date(p.publishedAt || p.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }))

  if (publishedPosts.length > 0) {
    content.writing.posts = publishedPosts
  }

  // Active services
  const activeServices = allServices
    .filter(s => s.active)
    .sort((a, b) => a.order - b.order)

  // Featured Media
  const featuredMedia = allMedia.filter(m => m.featured)
  if (featuredMedia.length > 0) {
    // If the gallery isn't configured, provide a default
    if (!content.gallery) content.gallery = { eyebrow: 'Featured', heading: 'Gallery', photos: [] }
    
    // Convert Media items to Gallery Photos
    const mappedPhotos = featuredMedia.map(m => ({
      src: m.kind === 'embed' ? m.thumbUrl || m.url : m.url,
      alt: m.alt || m.title || '',
      caption: m.caption || m.title || '',
      url: m.url,
      kind: m.kind
    }))
    
    // Append or prepend them to the existing static ones
    content.gallery.photos = [...content.gallery.photos, ...mappedPhotos]
  }

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

      <UtilityBar utility={content.utility} />
      <SiteNav nav={content.nav} resumeUrl={meta.resumeUrl} showThemeToggle={theme.darkMode === 'toggle'} />

      <main>
        {isVisible('hero') && <Hero hero={content.hero} meta={meta} />}
        {isVisible('creds') && <CredPills creds={content.creds} />}
        {isVisible('proof') && <ProofStrip proof={content.proof} />}
        {isVisible('audiences') && <Audiences audiences={content.audiences} />}
        {isVisible('ways') && <Ways ways={content.ways} />}

        {activeServices.length > 0 && isVisible('services') && (
          <Section id="services" tone="deep">
            <SectionHead 
              eyebrow="Offerings" 
              heading="Ways we can work together" 
              intro="Select a service to book a slot directly." 
            />
            <ServicesList services={activeServices} />
          </Section>
        )}

        {isVisible('ventures') && <Ventures ventures={content.ventures} />}
        {isVisible('projects') && <Projects projects={content.projects} />}
        {isVisible('pov') && <PointOfView pov={content.pov} />}
        {isVisible('contrasts') && <Contrasts contrasts={content.contrasts} />}
        {isVisible('gallery') && <Gallery gallery={content.gallery} />}
        {isVisible('writing') && <Writing writing={content.writing} />}
        {isVisible('oneCard') && <OneCard oneCard={content.oneCard} />}
        {isVisible('closing') && <Closing closing={content.closing} meta={meta} />}
      </main>

      <SiteFooter footer={content.footer} meta={meta} />
    </>
  )
}
