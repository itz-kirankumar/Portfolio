import type { ReactNode } from 'react'
import { getCachedSiteContent } from '@/lib/site'
import { SiteFooter, SiteNav, UtilityBar } from '@/components/site/Chrome'

export default async function ServicesLayout({ children }: { children: ReactNode }) {
  const content = await getCachedSiteContent()
  const { meta } = content

  return (
    <>
      <UtilityBar utility={content.utility} />
      <SiteNav nav={content.nav} resumeUrl={meta.resumeUrl} />
      <main className="min-h-[50vh]">
        {children}
      </main>
      <SiteFooter footer={content.footer} meta={meta} />
    </>
  )
}
