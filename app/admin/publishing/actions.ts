"use server"

import { putDoc } from '@/lib/store'
import { POSTS_COLLECTION, postSchema } from '@/lib/schemas/post'
import { revalidatePath } from 'next/cache'

export async function savePost(id: string, data: any) {
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

    // We use the new slug as the ID if the ID was 'new' or if slug changed
    // Note: If slug changes on an existing post, this creates a new doc.
    const docId = id === 'new' ? parsed.data.slug : id
    await putDoc(POSTS_COLLECTION, docId, postSchema, parsed.data)
    
    revalidatePath('/admin/publishing')
    return { success: true, id: docId }

  } catch (error: any) {
    console.error('Error saving post:', error)
    return { success: false, error: error.message || 'Failed to save post' }
  }
}
