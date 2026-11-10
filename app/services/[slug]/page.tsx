import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { safeGet, safeList } from '@/lib/store'
import { SERVICES_COLLECTION, serviceSchema } from '@/lib/schemas/service'
import { getCachedSiteContent } from '@/lib/site'

export const revalidate = 3600

export async function generateStaticParams() {
  const services = await safeList(SERVICES_COLLECTION, serviceSchema)
  return services.filter((s) => s.active).map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = await safeGet(SERVICES_COLLECTION, slug, serviceSchema)
  if (!service || !service.active) return {}
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const ogUrl = new URL('/api/og', siteUrl)
  ogUrl.searchParams.set('title', service.title)
  ogUrl.searchParams.set('type', 'service')

  return {
    title: service.title,
    description: service.summary,
    openGraph: {
      title: service.title,
      description: service.summary,
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: service.title,
      description: service.summary,
      images: [ogUrl.toString()],
      creator: (await getCachedSiteContent()).meta.twitterHandle,
    }
  }
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = await safeGet(SERVICES_COLLECTION, slug, serviceSchema)

  if (!service || !service.active) {
    notFound()
  }

  // No intermediate details page: selecting a service goes straight to the
  // combined booking screen, which carries the details alongside slot picking.
  redirect(`/services/${service!.slug}/book`)
}
