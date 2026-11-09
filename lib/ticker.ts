// lib/ticker.ts
//
// Items for the fixed status ticker above the nav: what is live, what is
// building, and the owner's current status line. Built from the same cached
// sources as the homepage so every page shows one consistent strip.

import { getCachedSiteContent } from '@/lib/site'
import { getWorks } from '@/lib/works'
import { safeList } from '@/lib/store'
import { SERVICES_COLLECTION, serviceSchema } from '@/lib/schemas/service'

export async function getTickItems(): Promise<string[]> {
  try {
    const [content, services, works] = await Promise.all([
      getCachedSiteContent(),
      safeList(SERVICES_COLLECTION, serviceSchema),
      getWorks(),
    ])
    return [
      ...content.ventures.items.map((v) => v.name),
      ...services.filter((s) => s.active).sort((a, b) => a.order - b.order).map((s) => s.title),
      ...works.filter((w) => w.status === 'building').map((w) => `building: ${w.title}`),
      content.utility.status,
    ].filter(Boolean)
  } catch {
    return []
  }
}
