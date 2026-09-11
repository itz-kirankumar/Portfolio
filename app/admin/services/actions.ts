'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { putDoc, deleteDocById } from '@/lib/store'
import { SERVICES_COLLECTION, serviceSchema } from '@/lib/schemas/service'

export async function saveService(id: string, data: any) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) return { ok: false, error: 'Not authorised.' }
  
  try {
    const docId = data.slug || id
    await putDoc(SERVICES_COLLECTION, docId, serviceSchema, {
      ...data,
      updatedAt: Date.now(),
      createdAt: data.createdAt || Date.now()
    })
    
    if (id !== 'new' && id !== docId) {
      await deleteDocById(SERVICES_COLLECTION, id)
    }
    
    revalidatePath('/')
    revalidatePath('/admin/services')
    revalidatePath('/services')
    revalidatePath(`/admin/services/${docId}`)
    return { ok: true, id: docId }
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return { ok: false, error: 'Validation failed', issues: err.issues }
    }
    return { ok: false, error: err.message }
  }
}

export async function deleteService(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) return { ok: false, error: 'Not authorised.' }
  
  await deleteDocById(SERVICES_COLLECTION, id)
  revalidatePath('/')
  revalidatePath('/admin/services')
  revalidatePath('/services')
  return { ok: true }
}
