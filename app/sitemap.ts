import type { MetadataRoute } from 'next'
import { safeList } from '@/lib/store'
import { POSTS_COLLECTION, postSchema } from '@/lib/schemas/post'
import { SERVICES_COLLECTION, serviceSchema } from '@/lib/schemas/service'
import { PAGES_COLLECTION, pageSchema } from '@/lib/schemas/page'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kirankumarg.com'

  const [posts, services, pages] = await Promise.all([
    safeList(POSTS_COLLECTION, postSchema),
    safeList(SERVICES_COLLECTION, serviceSchema),
    safeList(PAGES_COLLECTION, pageSchema),
  ])

  const publishedPosts = posts.filter(p => p.status === 'published')
  const activeServices = services.filter(s => s.active)

  const sitemap: MetadataRoute.Sitemap = [
    {
      url: base,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]

  publishedPosts.forEach((post) => {
    sitemap.push({
      url: `${base}/writing/${post.slug}`,
      lastModified: new Date(post.updatedAt || Date.now()),
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
      lastModified: new Date(page.updatedAt || Date.now()),
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  })

  return sitemap
}
