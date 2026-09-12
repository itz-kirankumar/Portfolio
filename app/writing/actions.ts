'use server'

import { getAdminDb } from '@/lib/admin'
import { POSTS_COLLECTION } from '@/lib/schemas/post'
import { revalidatePath } from 'next/cache'

export async function likePost(slug: string) {
  try {
    const db = getAdminDb()
    const ref = db.collection(POSTS_COLLECTION).doc(slug)
    await ref.update({
      likes: (await import('firebase-admin/firestore')).FieldValue.increment(1)
    })
    revalidatePath('/writing/' + slug)
    return { ok: true }
  } catch (err: any) {
    console.error('Failed to like post:', err)
    return { ok: false, error: err.message }
  }
}
import { COMMENTS_COLLECTION, commentSchema } from '@/lib/schemas/comment'
import { createStrict } from '@/lib/store'
import { randomUUID } from 'crypto'

export async function postComment(postId: string, name: string, text: string) {
  try {
    const data = {
      postId,
      name,
      text,
      createdAt: Date.now(),
      status: 'approved'
    }
    const parsed = commentSchema.parse(data)
    await createStrict(COMMENTS_COLLECTION, randomUUID(), commentSchema, parsed)
    revalidatePath('/writing/' + postId)
    return { ok: true }
  } catch (err: any) {
    console.error('Failed to post comment:', err)
    return { ok: false, error: err.message }
  }
}
