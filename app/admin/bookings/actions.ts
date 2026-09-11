'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { putDoc, deleteDocById } from '@/lib/store'
import { BOOKINGS_COLLECTION, bookingSchema } from '@/lib/schemas/booking'

export async function saveBooking(id: string, data: any) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) return { ok: false, error: 'Not authorised.' }
  
  try {
    await putDoc(BOOKINGS_COLLECTION, id, bookingSchema, {
      ...data,
      updatedAt: Date.now()
    })
    
    revalidatePath('/')
    revalidatePath('/admin/bookings')
    revalidatePath(`/admin/bookings/${id}`)
    return { ok: true, id }
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return { ok: false, error: 'Validation failed', issues: err.issues }
    }
    return { ok: false, error: err.message }
  }
}

export async function deleteBooking(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) return { ok: false, error: 'Not authorised.' }
  
  await deleteDocById(BOOKINGS_COLLECTION, id)
  revalidatePath('/')
  revalidatePath('/admin/bookings')
  return { ok: true }
}
