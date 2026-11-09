// lib/x-feed.ts
//
// Recent public X posts for the homepage's "Around the web" section.
//
// X has no first-party RSS and its API is pay-per-read. FxTwitter publishes a
// free per-profile RSS feed (verified serving @imkirankumarg on 9 Nov 2026).
// The mirror lags the real profile: on 9 Nov its head was ~6h and 2 posts
// behind the live profile head, so these are RECENT posts, never labeled
// "latest". The feed is public and fetched server-side - no visitor traffic
// or credentials ever touch the mirror, and item links point at x.com.
//
// Failure honesty (Kiran's rule: "if X not loaded then don't show X"): any
// fetch/parse failure returns [], and a feed whose newest item is older than
// STALE_AFTER_DAYS is treated as dead and also returns [] - the card hides
// rather than show stale posts as fresh. He posts near-daily, so a week of
// silence means the mirror broke, not that he went quiet.

export type XPost = {
  text: string
  date: string
  url: string
}

/** Feed heads older than this read as a dead mirror, not a quiet writer. */
const STALE_AFTER_DAYS = 7

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function unescape(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&')
}

function stripHtml(s: string): string {
  return unescape(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…'
}

export async function getLatestXPosts(handle: string, count = 3): Promise<XPost[]> {
  try {
    const res = await fetch(`https://fxtwitter.com/${handle}/feed.xml`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const xml = await res.text()
    const items: XPost[] = []
    for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
      const item = m[1]
      const link = item.match(/<link>([^<]+)<\/link>/)?.[1] ?? ''
      const pub = item.match(/<pubDate>([^<]+)<\/pubDate>/)?.[1] ?? ''
      const cdata = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] ?? ''
      const text = truncate(stripHtml(cdata), 220)
      const ts = Date.parse(pub)
      if (!link || !text || Number.isNaN(ts)) continue
      if (items.length === 0 && Date.now() - ts > STALE_AFTER_DAYS * 86400000) return []
      // Only link out to the real X status, never the mirror host.
      const statusUrl = link.replace(/^https?:\/\/(www\.)?(fxtwitter|fixupx)\.com/i, 'https://x.com')
      items.push({ text, date: dateFormat.format(new Date(ts)), url: statusUrl })
      if (items.length >= count) break
    }
    return items
  } catch {
    // Mirror down, rate-limited, or malformed: hide the card, show nothing stale.
    return []
  }
}
