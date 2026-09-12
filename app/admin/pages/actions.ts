'use server'

import { putDoc, deleteDocById } from '@/lib/store'
import { PAGES_COLLECTION, pageSchema } from '@/lib/schemas/page'
import { revalidatePath } from 'next/cache'

import { getSiteContent, saveSiteSection } from '@/lib/site'

export async function savePage(id: string, data: any) {
  try {
    const validated = pageSchema.parse(data)
    validated.updatedAt = Date.now()
    
    await putDoc(PAGES_COLLECTION, id, pageSchema, validated)

    const content = await getSiteContent()
    const nav = content.nav
    const targetHref = `/${validated.slug}` // Root-level slugs for pages

    const existingIndex = nav.links.findIndex((l: any) => l.href === targetHref || l.href === `/p/${validated.slug}`)

    let navChanged = false
    if (validated.showInNav && validated.status === 'published') {
      if (existingIndex === -1) {
        nav.links.push({
          label: validated.title,
          href: targetHref,
          newTab: false
        })
        navChanged = true
      } else {
        // Update label if it changed
        if (nav.links[existingIndex].label !== validated.title || nav.links[existingIndex].href !== targetHref) {
           nav.links[existingIndex].label = validated.title
           nav.links[existingIndex].href = targetHref
           navChanged = true
        }
      }
    } else {
      if (existingIndex !== -1) {
        nav.links.splice(existingIndex, 1)
        navChanged = true
      }
    }

    if (navChanged) {
      await saveSiteSection('nav', nav, 'draft') // Draft will sync when published
    }
    
    revalidatePath('/admin/pages')
    revalidatePath(`/${validated.slug}`)
    return { ok: true, id }
  } catch (error: any) {
    console.error('Save page failed:', error)
    return { ok: false, error: error.message }
  }
}

export async function deletePage(id: string, slug: string) {
  try {
    await deleteDocById(PAGES_COLLECTION, id)

    const content = await getSiteContent()
    const nav = content.nav
    
    // Remove from both potential hrefs
    const targetHrefRoot = `/${slug}`
    const targetHrefP = `/p/${slug}`
    const filteredLinks = nav.links.filter((l: any) => l.href !== targetHrefRoot && l.href !== targetHrefP)
    
    if (filteredLinks.length !== nav.links.length) {
      nav.links = filteredLinks
      await saveSiteSection('nav', nav, 'draft')
    }

    revalidatePath('/admin/pages')
    revalidatePath(`/${slug}`)
    return { ok: true }
  } catch (error: any) {
    console.error('Delete page failed:', error)
    return { ok: false, error: error.message }
  }
}
