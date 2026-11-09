"use server"

import { putDoc, deleteDocById } from '@/lib/store'
import { POSTS_COLLECTION, postSchema, readingMinutes } from '@/lib/schemas/post'
import { revalidatePath } from 'next/cache'
import { getOwnerSession } from '@/lib/guard'
import { getAdminDb } from '@/lib/admin'

const MAX_DRAFT_HTML = 300_000
const MAX_DRAFT_DOC = 400_000

/**
 * Editor autosave. Writes ONLY the private draft fields - never html/doc, so
 * the published article cannot change until the owner clicks "Save changes".
 * No public path is revalidated here.
 */
export async function saveDraft(id: string, draftHtml: string, draftDoc: string) {
  if (!(await getOwnerSession())) {
    return { success: false, error: 'Not authorised.' }
  }
  if (id === 'new') {
    return { success: false, error: 'Save the post once before autosave can run.' }
  }
  if (draftHtml.length > MAX_DRAFT_HTML || draftDoc.length > MAX_DRAFT_DOC) {
    return { success: false, error: 'This draft is too long to store.' }
  }
  try {
    const db = getAdminDb()
    await db.collection(POSTS_COLLECTION).doc(id).update({
      draftHtml,
      draftDoc,
      draftUpdatedAt: Date.now(),
    })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to save draft' }
  }
}

/** Clears the private draft without touching the published body. */
export async function discardDraft(id: string) {
  if (!(await getOwnerSession())) {
    return { success: false, error: 'Not authorised.' }
  }
  try {
    const db = getAdminDb()
    await db.collection(POSTS_COLLECTION).doc(id).update({
      draftHtml: '',
      draftDoc: '',
      draftUpdatedAt: 0,
    })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to discard draft' }
  }
}

export async function deletePost(id: string) {
  if (!(await getOwnerSession())) {
    return { success: false, error: 'Not authorised.' }
  }
  try {
    await deleteDocById(POSTS_COLLECTION, id)
    revalidatePath('/admin/publishing')
    revalidatePath('/writing')
    revalidatePath(`/writing/${id}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete post' }
  }
}

export async function savePost(id: string, data: any) {
  if (!(await getOwnerSession())) {
    return { success: false, error: 'Not authorised.' }
  }
  try {
    // Auto-generate slug if empty
    if (!data.slug) {
      const baseSlug = (data.title || 'untitled')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        
      data.slug = baseSlug || 'post-' + Date.now()
    }
    
    // Ensure numeric timestamps
    if (!data.createdAt) data.createdAt = Date.now()
    data.updatedAt = Date.now()

    const parsed = postSchema.safeParse(data)
    if (!parsed.success) {
        return { 
            success: false, 
            error: 'Validation failed', 
            issues: parsed.error.issues.map((i) => `${i.path.join('.') || 'value'}: ${i.message}`) 
        }
    }

    if (parsed.data.status === 'published' && parsed.data.publishedAt === 0) {
      parsed.data.publishedAt = Date.now()
    }

    // Keep the stored reading time truthful (schema default is 1 for legacy posts).
    parsed.data.readingMinutes = readingMinutes(parsed.data.html || '')

    // We use the new slug as the ID if the ID was 'new' or if slug changed
    // Note: If slug changes on an existing post, this creates a new doc.
    // An explicit save publishes the current editor content atomically and
    // clears the private draft, whatever the caller sent for those fields.
    parsed.data.draftHtml = ''
    parsed.data.draftDoc = ''
    parsed.data.draftUpdatedAt = 0

    const docId = id === 'new' ? parsed.data.slug : id
    await putDoc(POSTS_COLLECTION, docId, postSchema, parsed.data)
    
    revalidatePath('/admin/publishing')
    revalidatePath('/writing')
    revalidatePath(`/writing/${docId}`)
    return { success: true, id: docId }

  } catch (error: any) {
    console.error('Error saving post:', error)
    return { success: false, error: error.message || 'Failed to save post' }
  }
}
