'use server'

import { putDoc, deleteDocById } from '@/lib/store'
import { PAGES_COLLECTION, pageSchema } from '@/lib/schemas/page'
import { revalidatePath } from 'next/cache'

import { getSiteContent, saveSiteSection } from '@/lib/site'
import { getAdminDb } from '@/lib/admin'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

type NavablePage = { slug: string; title: string; showInNav?: boolean; status: string }

/** Keeps the public nav in step with a page's published state. */
async function syncNavForPage(page: NavablePage) {
  const content = await getSiteContent()
  const nav = content.nav
  const targetHref = `/${page.slug}`
  const existingIndex = nav.links.findIndex((l: any) => l.href === targetHref || l.href === `/p/${page.slug}`)

  if (page.showInNav && page.status === 'published') {
    if (existingIndex === -1) {
      nav.links.push({ label: page.title, href: targetHref, newTab: false })
    } else if (nav.links[existingIndex].label !== page.title || nav.links[existingIndex].href !== targetHref) {
      nav.links[existingIndex].label = page.title
      nav.links[existingIndex].href = targetHref
    } else {
      return
    }
  } else {
    if (existingIndex === -1) return
    nav.links.splice(existingIndex, 1)
  }
  await saveSiteSection('nav', nav, 'draft') // Draft will sync when published
}

/**
 * One-click publish/unpublish from the list. Status-only update plus nav
 * sync; content and timestamps are untouched.
 */
export async function setPageStatus(id: string, next: 'draft' | 'published') {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) return { ok: false, error: 'Not authorised.' }
  if (next !== 'draft' && next !== 'published') {
    return { ok: false, error: 'Unsupported status.' }
  }
  try {
    const db = getAdminDb()
    const ref = db.collection(PAGES_COLLECTION).doc(id)
    const snap = await ref.get()
    if (!snap.exists) {
      return { ok: false, error: 'Page not found - it may have been deleted.' }
    }
    const current = snap.data() as NavablePage & { status: string }
    if (current.status !== next) {
      await ref.update({ status: next, updatedAt: Date.now() })
    }
    await syncNavForPage({ ...current, status: next })
    revalidatePath('/admin/pages')
    revalidatePath(`/${current.slug || id}`)
    return { ok: true }
  } catch (error: any) {
    console.error('Set page status failed:', error)
    return { ok: false, error: error.message }
  }
}

export async function savePage(id: string, data: any) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) return { ok: false, error: 'Not authorised.' }
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
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) return { ok: false, error: 'Not authorised.' }
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
