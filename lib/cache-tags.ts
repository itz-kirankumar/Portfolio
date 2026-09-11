// lib/cache-tags.ts
//
// One tag per collection. Public readers wrap their fetch in `unstable_cache`
// with the tag; mutations call `revalidateTag(tag, 'max')`.
//
// The second argument to revalidateTag is REQUIRED in Next 16 — the one-arg
// form is a type error. 'max' gives the longest stale-while-revalidate window.
//
// This project does not set `cacheComponents`, so it stays on the previous
// caching model: unstable_cache + revalidateTag + revalidatePath. Do not mix in
// `use cache` / `cacheTag` / `updateTag` — those belong to Cache Components.

export const SITE_TAG = 'site-content' // must match lib/site.ts SITE_CACHE_TAG
export const MEDIA_TAG = 'media'
export const POSTS_TAG = 'posts'
export const SERVICES_TAG = 'services'
export const THEME_TAG = 'theme'
export const AVAILABILITY_TAG = 'availability'

/** Collections whose contents are never cached: they are per-visitor or write-heavy. */
export const UNCACHED = ['bookings', 'subscribers'] as const
