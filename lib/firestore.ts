// lib/firestore.ts
import {
  doc, collection, getDocs, getDoc, setDoc,
  updateDoc, deleteDoc, query, orderBy, where,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Block, UserProfile } from '@/types'

// ─── PROFILE ────────────────────────────────────────────────

export async function getProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    return snap.exists() ? (snap.data() as UserProfile) : null
  } catch (err) {
    console.error('[Firestore] getProfile error:', err)
    return null
  }
}

export async function getProfileByUsername(username: string): Promise<UserProfile | null> {
  try {
    const q    = query(collection(db, 'users'), where('username', '==', username))
    const snap = await getDocs(q)
    if (snap.empty) return null
    return snap.docs[0].data() as UserProfile
  } catch (err) {
    console.error('[Firestore] getProfileByUsername error:', err)
    return null
  }
}

export async function createProfile(uid: string, data: Partial<UserProfile>) {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    uid,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })
}

export async function updateProfile(uid: string, data: Partial<UserProfile>) {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: Date.now(),
  })
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  try {
    const q    = query(collection(db, 'users'), where('username', '==', username))
    const snap = await getDocs(q)
    return snap.empty
  } catch {
    return false
  }
}

// ─── BLOCKS ─────────────────────────────────────────────────

export async function getBlocks(uid: string): Promise<Block[]> {
  try {
    const q    = query(collection(db, 'users', uid, 'blocks'), orderBy('order', 'asc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Block))
  } catch (err) {
    console.error('[Firestore] getBlocks error:', err)
    return []
  }
}

export async function createBlock(uid: string, block: Omit<Block, 'id'>): Promise<string> {
  const ref = doc(collection(db, 'users', uid, 'blocks'))
  await setDoc(ref, {
    ...block,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })
  return ref.id
}

export async function updateBlock(uid: string, blockId: string, data: Partial<Block>) {
  await updateDoc(doc(db, 'users', uid, 'blocks', blockId), {
    ...data,
    updatedAt: Date.now(),
  })
}

export async function deleteBlock(uid: string, blockId: string) {
  await deleteDoc(doc(db, 'users', uid, 'blocks', blockId))
}

export async function reorderBlocks(uid: string, blocks: { id: string; order: number }[]) {
  const batch = writeBatch(db)
  blocks.forEach(({ id, order }) => {
    batch.update(doc(db, 'users', uid, 'blocks', id), {
      order,
      updatedAt: Date.now(),
    })
  })
  await batch.commit()
}