import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { safeList } from '@/lib/store'
import { PAGES_COLLECTION, pageSchema } from '@/lib/schemas/page'
import { SiteFooter, SiteNav, UtilityBar } from '@/components/site/Chrome'
import { getCachedSiteContent } from '@/lib/site'

export const revalidate = 3600

import { cookies } from 'next/headers'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Omit<Props, 'searchParams'>): Promise<Metadata> {
  const { slug } = await params
  const pages = await safeList(PAGES_COLLECTION, pageSchema, {
    where: [['slug', '==', slug]],
    limit: 1
  })
  const page = pages[0]
  
  if (!page) return {}
  
  const { meta } = await getCachedSiteContent()
  const title = `${page.title} — ${meta.name}`
  
  return {
    title,
  }
}

export default async function CustomPageRender({ params, searchParams }: Props) {
  const { slug } = await params
  const search = await searchParams
  const isPreview = search.preview === 'true'
  
  // Need to query by slug
  const pages = await safeList(PAGES_COLLECTION, pageSchema, {
    where: [['slug', '==', slug]],
    limit: 1
  })
  const page = pages[0]

  let isAllowed = false
  if (page?.status === 'published') isAllowed = true
  if (page && isPreview) {
    const session = (await cookies()).get('__session')
    if (session) isAllowed = true
  }

  if (!isAllowed || !page) {
    notFound()
  }

  const content = await getCachedSiteContent()
  const { meta } = content

  return (
    <>
      <UtilityBar utility={content.utility} />
      <SiteNav nav={content.nav} resumeUrl={meta.resumeUrl} />

      <main className="min-h-screen bg-paper pb-16 pt-16 sm:pb-24 sm:pt-24 lg:pb-32 lg:pt-32">
        <article>
          <header className="mx-auto max-w-2xl px-6 lg:px-8">
            <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-ink">
              {page.title}
            </h1>
          </header>

          <div 
            className="prose prose-stone prose-lg mx-auto mt-16 max-w-2xl px-6 text-ink lg:px-8"
            dangerouslySetInnerHTML={{ __html: page.html }} 
          />
        </article>
      </main>

      <SiteFooter footer={content.footer} meta={meta} />
    </>
  )
}
