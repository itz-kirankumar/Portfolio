// "Around the web" section. X posts come from a server-fetched free mirror
// feed (see lib/x-feed.ts) that runs some hours behind the live profile, so
// the card says "Recent", every card carries its real date, and a dead or
// stale feed hides the card entirely - Kiran's rule, no dead placeholder. LinkedIn has no free reliable profile feed, so its side is a
// curated pair of site-styled cards with real excerpts, dates, and source
// links - labeled "Selected", never "latest".

import type { XPost } from '@/lib/x-feed'

export type LinkedInPostCard = {
  title: string
  date: string
  excerpt: string
  url: string
}

export function SocialFeed({
  xHandle,
  xPosts = [],
  linkedinProfileUrl,
  linkedinPosts = [],
}: {
  xHandle?: string
  xPosts?: XPost[]
  linkedinProfileUrl?: string
  linkedinPosts?: LinkedInPostCard[]
}) {
  const showX = Boolean(xHandle) && xPosts.length > 0
  if (!showX && !linkedinProfileUrl && linkedinPosts.length === 0) return null

  const cardHead = (label: string, href: string, cta: string) => (
    <div className="mb-5 flex items-center justify-between">
      <h3 className="font-mono text-xs uppercase tracking-widest text-ink-soft">
        {label}
      </h3>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-xs text-coral-ink hover:underline"
      >
        {cta} ↗
      </a>
    </div>
  )

  return (
    <section id="latest" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-soft">
        Elsewhere
      </p>
      <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        Around the web
      </h2>
      <div className={`mt-8 grid items-start gap-8 ${showX ? 'lg:grid-cols-2' : ''}`}>
        {showX && (
          <div className="rounded-2xl border border-rule bg-card p-5">
            {cardHead('Recent on X', `https://x.com/${xHandle}`, `@${xHandle}`)}
            <div className="flex flex-col gap-4">
              {xPosts.map((p) => (
                <a
                  key={p.url}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl border border-rule bg-paper-deep/40 p-4 transition hover:border-coral/50"
                >
                  <p className="font-mono text-[11px] text-ink-soft">{p.date}</p>
                  <p className="mt-1.5 line-clamp-4 text-sm leading-relaxed text-ink">
                    {p.text}
                  </p>
                  <p className="mt-2 font-mono text-xs text-coral-ink">
                    Read on X ↗
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}
        {linkedinProfileUrl && (
          <div className="rounded-2xl border border-rule bg-card p-5">
            {cardHead('Selected LinkedIn posts', linkedinProfileUrl, 'Profile')}
            <div className={`gap-4 ${showX ? 'flex flex-col' : 'grid sm:grid-cols-2'}`}>
              {linkedinPosts.map((p) => (
                <a
                  key={p.url}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl border border-rule bg-paper-deep/40 p-4 transition hover:border-coral/50"
                >
                  <p className="font-mono text-[11px] text-ink-soft">{p.date}</p>
                  <p className="mt-1.5 font-medium leading-snug text-ink group-hover:text-coral-ink">
                    {p.title}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                    {p.excerpt}
                  </p>
                  <p className="mt-2 font-mono text-xs text-coral-ink">
                    Read on LinkedIn ↗
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
