'use server'

import { putDoc } from '@/lib/store'
import { PAGES_COLLECTION, pageSchema } from '@/lib/schemas/page'
import { revalidatePath } from 'next/cache'

import { getSiteContent, saveSiteSection } from '@/lib/site'

export async function savePage(id: string, data: any, addToNav?: boolean) {
  try {
    const validated = pageSchema.parse(data)
    validated.updatedAt = Date.now()
    
    await putDoc(PAGES_COLLECTION, id, pageSchema, validated)

    if (addToNav && validated.status === 'published') {
      const content = await getSiteContent()
      const nav = content.nav
      const targetHref = `/p/${validated.slug}`
      if (!nav.links.find((l: any) => l.href === targetHref)) {
        nav.links.push({
          label: validated.title,
          href: targetHref,
          newTab: false
        })
        await saveSiteSection('nav', nav)
      }
    }
    
    revalidatePath('/admin/pages')
    revalidatePath(`/${validated.slug}`)
    return { ok: true, id }
  } catch (error: any) {
    console.error('Save page failed:', error)
    return { ok: false, error: error.message }
  }
}
