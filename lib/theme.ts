import { unstable_cache } from 'next/cache'
import { getAdminDb, hasAdminCredentials } from '@/lib/admin'
import { THEME_COLLECTION, THEME_DOC, themeSchema, DEFAULT_THEME, Theme } from '@/lib/schemas/theme'

export const THEME_CACHE_TAG = 'theme'

export async function getThemeContent(): Promise<Theme> {
  if (!hasAdminCredentials()) return DEFAULT_THEME

  try {
    const snap = await getAdminDb().collection(THEME_COLLECTION).doc(THEME_DOC).get()
    if (!snap.exists) return DEFAULT_THEME
    return themeSchema.parse(snap.data())
  } catch (err) {
    console.error('[theme] read failed, falling back to defaults:', err)
    return DEFAULT_THEME
  }
}

export const getCachedTheme = unstable_cache(getThemeContent, ['site-theme'], {
  tags: [THEME_CACHE_TAG],
  revalidate: false,
})