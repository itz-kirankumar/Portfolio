'use server'

import { putDoc } from '@/lib/store'
import { PAGES_COLLECTION, pageSchema } from '@/lib/schemas/page'
import { revalidatePath } from 'next/cache'

export async function savePage(id: string, data: any) {
  try {
    const validated = pageSchema.parse(data)
    validated.updatedAt = Date.now()
    
    await putDoc(PAGES_COLLECTION, id, pageSchema, validated)
    
    revalidatePath('/admin/pages')
    revalidatePath(`/${validated.slug}`)
    return { ok: true, id }
  } catch (error: any) {
    console.error('Save page failed:', error)
    return { ok: false, error: error.message }
  }
}
