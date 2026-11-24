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

/* One case = one card + one detail page. Each case holds several view-only
   documents (the files above, keyed by slug). Swapping a file does not
   change this config. */
export type CaseGroup = {
  slug: string
  title: string
  kicker: string
  summary: string
  question: string
  facts: { label: string; value: string }[]
  steps: string[]
  docs: { slug: string; tab: string }[]
}

export const CASE_GROUPS: CaseGroup[] = [
  {
    slug: 'modi-illva',
    title: 'Modi Illva India: Where Should AI Go First?',
    kicker: "Masters' Union ELP case",
    summary:
      "A case from the Masters' Union Experiential Learning Program. My team was asked where AI can create real value at Modi Illva India, a spirits and brands joint venture, and what to start with first.",
    question:
      'Where in the business can AI create real value in the next 12 months, and what should the company start with in the next 90 days?',
    facts: [
      { label: 'Company', value: 'Modi Illva India Pvt. Ltd., 50:50 joint venture of the Umesh Modi Group and Illva Saronno' },
      { label: 'Brands', value: 'Artic Vodka, Rockford Reserve, Rockford Classic, Singhasan' },
      { label: 'Program', value: "Masters' Union Experiential Learning Program, Opportunity 1" },
      { label: 'Output', value: 'A deck of up to 10 slides plus up to 3 appendix slides' },
      { label: 'Submitted', value: '24 November 2026' },
    ],
    steps: [
      'Map at least 5 AI opportunities across the full value chain',
      'Prioritise them and pick the top 3',
      'Go deep on the number one opportunity: problem, data, daily use and results',
    ],
    docs: [
      { slug: 'modi-illva-deck', tab: 'My deck' },
      { slug: 'modi-illva-case', tab: 'Case brief' },
    ],
  },
]

export async function getCaseGroupDocs(g: CaseGroup) {
  const docs = await Promise.all(g.docs.map((d) => getCase(d.slug)))
  return g.docs.map((d, i) => ({ ...d, file: docs[i] })).filter((d) => d.file) as {
    slug: string; tab: string; file: CaseFile
  }[]
}
