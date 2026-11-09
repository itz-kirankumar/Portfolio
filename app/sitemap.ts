import type { MetadataRoute } from 'next'
import { safeList } from '@/lib/store'
import { POSTS_COLLECTION, postSchema } from '@/lib/schemas/post'
import { SERVICES_COLLECTION, serviceSchema } from '@/lib/schemas/service'
import { PAGES_COLLECTION, pageSchema } from '@/lib/schemas/page'
import { getWorks } from '@/lib/works'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kirankumarg.me'

  const [posts, services, pages, works] = await Promise.all([
    safeList(POSTS_COLLECTION, postSchema),
    safeList(SERVICES_COLLECTION, serviceSchema),
    safeList(PAGES_COLLECTION, pageSchema),
    getWorks(),
  ])

  const publishedPosts = posts.filter(p => p.status === 'published')
  const activeServices = services.filter(s => s.active)

  const sitemap: MetadataRoute.Sitemap = [
    {
      url: base,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${base}/work`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]

  // Only emit lastModified for dates that are real; some records carry
  // junk timestamps (e.g. 2) that render as 1970-01-01 to crawlers.
  const validDate = (value: unknown): Date | undefined => {
    const d = value ? new Date(value as string | number) : undefined
    return d && !isNaN(+d) && +d > 946684800000 ? d : undefined
  }

  works.forEach((work) => {
    sitemap.push({
      url: `${base}/work/${work.slug}`,
      lastModified: validDate(work.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  })

  publishedPosts.forEach((post) => {
    sitemap.push({
      url: `${base}/writing/${post.slug}`,
      lastModified: validDate(post.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.8,
    })
  })

  activeServices.forEach((service) => {
    sitemap.push({
      url: `${base}/services/${service.slug}`,
      changeFrequency: 'monthly',
      priority: 0.8,
    })
  })

  pages.forEach((page) => {
    sitemap.push({
      url: `${base}/${page.slug}`,
      lastModified: validDate(page.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  })

  return sitemap
}
