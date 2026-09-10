// lib/site.ts
//
// Read and write the single Firestore document `site/content`.
//
// Two rules keep this honest:
//
//   READ  — resolution is TOP-LEVEL-KEY PRESENCE ONLY, never a deep merge.
//           A deep merge would resurrect deleted rows: remove your last
//           credential pill, save, reload, and all six defaults reappear with
//           no way to get rid of them. `undefined` means "never written" and
//           falls back; `[]`, `''` and `null` mean the user meant that.
//
//   WRITE — replace the whole section with mergeFields, never `{ merge: true }`.
//           Plain merge recurses into nested maps, so clearing hero.portrait
//           would leave the old photo behind forever.

import { unstable_cache } from 'next/cache'
import { getAdminDb, hasAdminCredentials } from '@/lib/admin'
import { DEFAULT_CONTENT } from '@/lib/default-content'
import { SCHEMA_VERSION, type SectionKey, type SiteContent, type StoredSite } from '@/types/site'

const DOC_PATH = { collection: 'site', id: 'content' } as const

export const SITE_CACHE_TAG = 'site-content'

function resolve(stored: StoredSite | null): SiteContent {
  const out = {} as SiteContent
  for (const key of Object.keys(DEFAULT_CONTENT) as SectionKey[]) {
    const value = stored?.[key]
    out[key] = (value !== undefined && value !== null ? value : DEFAULT_CONTENT[key]) as never
  }
  return out
}

/**
 * Step-function migrations, applied in order. Each entry takes a document at
 * version N and returns one at version N+1. Add to this when SCHEMA_VERSION
 * bumps; leave it empty otherwise.
 */
const MIGRATIONS: Record<number, (doc: StoredSite) => StoredSite> = {}

function migrate(stored: StoredSite): StoredSite {
  let doc = stored
  let version = doc.schemaVersion ?? 1
  while (version < SCHEMA_VERSION && MIGRATIONS[version]) {
    doc = MIGRATIONS[version](doc)
    version += 1
  }
  return doc
}

/**
 * Never throws. `/` is statically prerendered, which means `next build`
 * executes this — if it threw, a build on any machine without FIREBASE_ADMIN_*
 * would fail outright instead of producing a correctly seeded page.
 */
export async function getSiteContent(): Promise<SiteContent> {
  if (!hasAdminCredentials()) return resolve(null)

  try {
    const snap = await getAdminDb().collection(DOC_PATH.collection).doc(DOC_PATH.id).get()
    if (!snap.exists) return resolve(null)
    return resolve(migrate(snap.data() as StoredSite))
  } catch (err) {
    console.error('[site] read failed, falling back to defaults:', err)
    return resolve(null)
  }
}

/** Cached for the public page. Invalidated by `revalidateTag(SITE_CACHE_TAG, 'max')`. */
export const getCachedSiteContent = unstable_cache(getSiteContent, ['site-content'], {
  tags: [SITE_CACHE_TAG],
  revalidate: false,
})

/** When the document was last saved, or null. Used by the /admin index. */
export async function getSiteUpdatedAt(): Promise<number | null> {
  if (!hasAdminCredentials()) return null
  try {
    const snap = await getAdminDb().collection(DOC_PATH.collection).doc(DOC_PATH.id).get()
    const data = snap.data() as StoredSite | undefined
    return data?.updatedAt ?? null
  } catch {
    return null
  }
}

/**
 * The only write API. Deliberately per-section: a whole-document setter would
 * let two open admin tabs clobber each other's unrelated edits.
 */
export async function saveSiteSection<K extends SectionKey>(
  section: K,
  value: SiteContent[K]
): Promise<void> {
  await getAdminDb()
    .collection(DOC_PATH.collection)
    .doc(DOC_PATH.id)
    .set(
      { [section]: value, schemaVersion: SCHEMA_VERSION, updatedAt: Date.now() },
      { mergeFields: [section, 'schemaVersion', 'updatedAt'] }
    )
}
