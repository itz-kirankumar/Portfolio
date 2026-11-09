// lib/works.ts
//
// Read layer for the works wall. Mirrors lib/site.ts's contract: never throw
// on a public path. When the `works` collection is empty (or Firestore is
// unreachable, including `next build` with no credentials) the code-seeded
// DEFAULT_WORKS take over so the wall and /work pages always render.

import { safeList } from '@/lib/store'
import { DEFAULT_WORKS } from '@/lib/default-works'
import { WORKS_COLLECTION, workSchema, type Work } from '@/lib/schemas/work'

function sortWorks(works: Work[]): Work[] {
  return [...works].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    return a.order - b.order || a.title.localeCompare(b.title)
  })
}

/** All works, featured first then by manual order. Falls back to the seed. */
export async function getWorks(): Promise<Work[]> {
  const stored = await safeList(WORKS_COLLECTION, workSchema)
  return sortWorks(stored.length > 0 ? stored : DEFAULT_WORKS)
}

/** One work by slug, for /work/[slug]. Seed works resolve too. */
export async function getWork(slug: string): Promise<Work | null> {
  const works = await getWorks()
  return works.find((w) => w.slug === slug || w.id === slug) ?? null
}
