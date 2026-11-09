'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { putDoc, deleteDocById } from '@/lib/store'
import { WORKS_COLLECTION, workSchema } from '@/lib/schemas/work'

function revalidateWorkPaths(slug?: string) {
  revalidatePath('/')
  revalidatePath('/work')
  if (slug) revalidatePath(`/work/${slug}`)
  revalidatePath('/admin/works')
}

export async function saveWork(id: string, data: any) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) return { ok: false, error: 'Not authorised.' }

  try {
    const docId = data.slug || id
    await putDoc(WORKS_COLLECTION, docId, workSchema, {
      ...data,
      updatedAt: Date.now(),
      createdAt: data.createdAt || Date.now(),
    })

    if (id !== 'new' && id !== docId) {
      await deleteDocById(WORKS_COLLECTION, id)
      revalidatePath(`/work/${id}`)
    }

    revalidateWorkPaths(docId)
    return { ok: true, id: docId }
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return { ok: false, error: 'Validation failed', issues: err.issues }
    }
    return { ok: false, error: err.message }
  }
}

export async function deleteWork(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) return { ok: false, error: 'Not authorised.' }

  await deleteDocById(WORKS_COLLECTION, id)
  revalidateWorkPaths(id)
  return { ok: true }
}
