'use server'
// app/admin/actions.ts
//
// Saves go through a Server Action rather than a route handler on purpose.
// `revalidatePath` inside a route handler only *marks* the path — the browser's
// Client Router Cache keeps serving the old `/` for up to five minutes, so
// clicking "Preview site" right after saving would show stale content and read
// as a bug. In a Server Action the router cache is updated in the same response.
//
// Authentication happens inside the action. Server Actions POST to the page
// route, so a layout-level gate is a UX affordance, not a security boundary.

import { revalidatePath, revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SECTION_SCHEMAS, isSectionKey } from '@/lib/site-schema'
import { SITE_CACHE_TAG, saveSiteSection } from '@/lib/site'
import type { SectionKey, SiteContent } from '@/types/site'

export type SaveResult =
  | { ok: true; savedAt: number }
  | { ok: false; error: string; issues?: string[] }

export async function saveSection(section: string, raw: unknown): Promise<SaveResult> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) {
    return { ok: false, error: 'Not authorised.' }
  }

  if (!isSectionKey(section)) {
    return { ok: false, error: `Unknown section "${section}".` }
  }

  const parsed = SECTION_SCHEMAS[section].safeParse(raw)
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Some fields did not validate.',
      issues: parsed.error.issues.map(
        (i) => `${i.path.join('.') || 'value'}: ${i.message}`
      ),
    }
  }

  try {
    await saveSiteSection(
      section as SectionKey,
      parsed.data as SiteContent[SectionKey]
    )
  } catch (err) {
    console.error('[admin] save failed:', err)
    return { ok: false, error: 'Could not write to the database.' }
  }

  revalidateTag(SITE_CACHE_TAG, 'max') // one-arg form is a type error in 16.2.3
  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath(`/admin/${section}`)

  return { ok: true, savedAt: Date.now() }
}
