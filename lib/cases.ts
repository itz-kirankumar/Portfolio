// lib/cases.ts
//
// "Cases I worked": view-only case files. Pages are stored as AES-256-GCM
// ciphertext in Firestore (key in the CASES_KEY env var, never in the repo or
// database) and decrypted per request by /api/cases. Server-only.

import { createDecipheriv } from 'node:crypto'
import { getAdminDb, hasAdminCredentials } from '@/lib/admin'

export const CASES_COLLECTION = 'caseFiles'

export type CaseFile = {
  slug: string
  title: string
  kind: 'deck' | 'case'
  blurb: string
  pages: number
  version: number
  versionLabel: string
  updatedAt: number
  order: number
  aspect: number // width / height
}

export async function getCases(): Promise<CaseFile[]> {
  if (!hasAdminCredentials()) return []
  try {
    const snap = await getAdminDb().collection(CASES_COLLECTION).get()
    return snap.docs
      .map((d) => ({ slug: d.id, ...(d.data() as Omit<CaseFile, 'slug'>) }))
      .filter((c) => c.pages > 0)
      .sort((a, b) => a.order - b.order)
  } catch (err) {
    console.error('[cases] read failed:', err)
    return []
  }
}

export async function getCase(slug: string): Promise<CaseFile | null> {
  if (!/^[a-z0-9-]{1,60}$/.test(slug) || !hasAdminCredentials()) return null
  try {
    const d = await getAdminDb().collection(CASES_COLLECTION).doc(slug).get()
    if (!d.exists) return null
    const c = { slug, ...(d.data() as Omit<CaseFile, 'slug'>) }
    return c.pages > 0 ? c : null
  } catch {
    return null
  }
}

export async function readCasePage(slug: string, page: number): Promise<Buffer | null> {
  const key = process.env.CASES_KEY
  if (!key || !Number.isInteger(page) || page < 1) return null
  const c = await getCase(slug)
  if (!c || page > c.pages) return null
  const snap = await getAdminDb()
    .collection(CASES_COLLECTION).doc(slug)
    .collection('pages').doc(`v${c.version}_${page}`).get()
  if (!snap.exists) return null
  const raw = Buffer.from(snap.get('data') as Uint8Array)
  const iv = raw.subarray(0, 12)
  const tag = raw.subarray(12, 28)
  const ct = raw.subarray(28)
  const dec = createDecipheriv('aes-256-gcm', Buffer.from(key, 'base64'), iv)
  dec.setAAD(Buffer.from(`${slug}:${c.version}:${page}`))
  dec.setAuthTag(tag)
  return Buffer.concat([dec.update(ct), dec.final()])
}
