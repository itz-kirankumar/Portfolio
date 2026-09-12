'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { putDoc, createStrict, deleteDocById } from '@/lib/store'
import { MEDIA_COLLECTION, mediaSchema } from '@/lib/schemas/media'
import { randomUUID } from 'crypto'

export type SaveResult =
  | { ok: true; id: string; savedAt: number }
  | { ok: false; error: string; issues?: string[] }

export async function saveMedia(id: string | null, raw: unknown): Promise<SaveResult> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) {
    return { ok: false, error: 'Not authorised.' }
  }

  const parsed = mediaSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Media validation failed.',
      issues: parsed.error.issues.map(
        (i) => `${i.path.join('.') || 'value'}: ${i.message}`
      ),
    }
  }

  try {
    const data = parsed.data
    data.updatedAt = Date.now()
    if (!id) {
      data.createdAt = Date.now()
    }
    
    const mediaId = id || randomUUID()
    
    if (!id) {
      await createStrict(MEDIA_COLLECTION, mediaId, mediaSchema, data)
    } else {
      await putDoc(MEDIA_COLLECTION, mediaId, mediaSchema, data)
    }

    revalidateTag('media', 'max')
    revalidatePath('/')
    revalidatePath('/admin/media')

    return { ok: true, id: mediaId, savedAt: Date.now() }
  } catch (err: any) {
    console.error('[admin] save media failed:', err)
    return { ok: false, error: err.message || 'Could not save media.' }
  }
}

export async function deleteMedia(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) {
    return { ok: false, error: 'Not authorised.' }
  }

  try {
    await deleteDocById(MEDIA_COLLECTION, id)
    revalidateTag('media', 'max')
    revalidatePath('/')
    revalidatePath('/admin/media')
    return { ok: true }
  } catch (err: any) {
    console.error('[admin] delete media failed:', err)
    return { ok: false, error: err.message || 'Could not delete media.' }
  }
}

import { safeList } from '@/lib/store'
export async function getAllMedia(limit = 50, offset = 0) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) return []
  return safeList(MEDIA_COLLECTION, mediaSchema, { orderBy: ['createdAt', 'desc'], limit, offset })
}
