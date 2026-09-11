'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { putSingleton } from '@/lib/store'
import { THEME_COLLECTION, THEME_DOC, themeSchema } from '@/lib/schemas/theme'

export type SaveResult =
  | { ok: true; savedAt: number }
  | { ok: false; error: string; issues?: string[] }

export async function saveTheme(raw: unknown): Promise<SaveResult> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) {
    return { ok: false, error: 'Not authorised.' }
  }

  const parsed = themeSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Theme settings did not validate.',
      issues: parsed.error.issues.map(
        (i) => `${i.path.join('.') || 'value'}: ${i.message}`
      ),
    }
  }

  try {
    const data = parsed.data
    data.updatedAt = Date.now()
    await putSingleton(THEME_COLLECTION, THEME_DOC, themeSchema, data)
  } catch (err) {
    console.error('[admin] save theme failed:', err)
    return { ok: false, error: 'Could not write theme to the database.' }
  }

  revalidateTag('theme', 'max')
  revalidatePath('/')
  revalidatePath('/admin/theme')

  return { ok: true, savedAt: Date.now() }
}
