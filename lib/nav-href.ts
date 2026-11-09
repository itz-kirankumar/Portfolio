// lib/nav-href.ts
//
// Shared nav href resolution (used by the client Chrome and server Hero).

export function isExternal(href: string) {
  return /^https?:|^mailto:|^tel:/.test(href)
}

/** Section anchors that have graduated to a dedicated page. The stored nav
    lives in Firestore, so the remap happens at render time. */
const SECTION_ROUTES: Record<string, string> = {
  '/#writing': '/writing',
  '/#ventures': '/work',
  '/#proof': '/work',
  '/#how-i-work': '/#about',
}

/** Bare '#anchor' → '/#anchor' so it points at the home page from anywhere,
    then redirect any anchor that now has a real page of its own. */
export function normalizeHref(href: string) {
  const withSlash = href.startsWith('#') ? `/${href}` : href
  return SECTION_ROUTES[withSlash] ?? withSlash
}
