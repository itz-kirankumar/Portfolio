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

/** Drop nav entries whose section no longer exists or that duplicate another
    entry after remapping. Stored nav lives in Firestore, so consolidation
    happens at render time: '/#proof' retired (its evidence lives on /work
    cards), and 'How I work' folds into 'About' since both target #about. */
export function normalizeNavLinks<T extends { href: string }>(links: T[]): T[] {
  const hasAbout = links.some((l) => {
    const h = l.href.startsWith('#') ? `/${l.href}` : l.href
    return h === '/#about'
  })
  const seen = new Set<string>()
  return links.filter((l) => {
    const raw = l.href.startsWith('#') ? `/${l.href}` : l.href
    if (raw === '/#proof') return false
    if (raw === '/#how-i-work' && hasAbout) return false
    const resolved = normalizeHref(l.href)
    if (seen.has(resolved)) return false
    seen.add(resolved)
    return true
  })
}
