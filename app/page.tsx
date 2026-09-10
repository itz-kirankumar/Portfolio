// app/page.tsx
//
// The portfolio. Statically prerendered and revalidated hourly; the admin's
// Server Action busts it immediately via revalidateTag/revalidatePath.
//
// This page must never call getServerSession() — that reads cookies(), which
// would make the whole route dynamic and throw away the prerender.

import type { Metadata } from 'next'
import { SiteFooter, SiteNav, UtilityBar } from '@/components/site/Chrome'
import { CredPills, Hero, ProofStrip } from '@/components/site/Hero'
import { Audiences, Projects, Ventures, Ways } from '@/components/site/Work'
import {
  Closing,
  Contrasts,
  Gallery,
  OneCard,
  PointOfView,
  Writing,
} from '@/components/site/Voice'
import { getCachedSiteContent } from '@/lib/site'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const { meta, hero } = await getCachedSiteContent()
  const title = `${meta.name} — ${meta.descriptor.replace(/\.$/, '')}`
  const description = hero.subhead.slice(0, 200)

  return {
    title: { absolute: title },
    description,
    openGraph: { title, description },
    twitter: { title, description },
  }
}

export default async function HomePage() {
  const content = await getCachedSiteContent()
  const { meta } = content

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
      <SiteNav nav={content.nav} resumeUrl={meta.resumeUrl} />

      <main>
        <Hero hero={content.hero} meta={meta} />
        <CredPills creds={content.creds} />
        <ProofStrip proof={content.proof} />
        <Audiences audiences={content.audiences} />
        <Ways ways={content.ways} />
        <Ventures ventures={content.ventures} />
        <Projects projects={content.projects} />
        <PointOfView pov={content.pov} />
        <Contrasts contrasts={content.contrasts} />
        <Gallery gallery={content.gallery} />
        <Writing writing={content.writing} />
        <OneCard oneCard={content.oneCard} />
        <Closing closing={content.closing} meta={meta} />
      </main>

      <SiteFooter footer={content.footer} meta={meta} />
    </>
  )
}
