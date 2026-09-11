'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { putSingleton } from '@/lib/store'
import { AVAILABILITY_COLLECTION, AVAILABILITY_DOC, availabilitySchema } from '@/lib/schemas/availability'

export async function saveAvailability(data: any) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) return { ok: false, error: 'Not authorised.' }
  
  try {
    await putSingleton(AVAILABILITY_COLLECTION, AVAILABILITY_DOC, availabilitySchema, {
      ...data,
      updatedAt: Date.now()
    })
    
    revalidatePath('/')
    revalidatePath('/admin/calendar')
    revalidatePath('/services')
    return { ok: true }
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return { ok: false, error: 'Validation failed', issues: err.issues }
    }
    return { ok: false, error: err.message }
  }
}
