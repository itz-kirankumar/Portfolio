'use client'

// "Latest posts" section: live X timeline (official free embed, public posts
// only) plus optional curated LinkedIn per-post embeds (official, public).
// LinkedIn offers no free automated profile feed, so LinkedIn posts are a
// curated list of official embeds; X updates automatically.

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    twttr?: { widgets?: { load: (el?: HTMLElement | null) => void } }
  }
}

export type LinkedInEmbed = {
  /** Post URN, e.g. urn:li:share:7123456789012345678 or urn:li:ugcPost:... */
  urn: string
  label?: string
}

export function SocialFeed({
  xHandle,
  linkedinProfileUrl,
  linkedinPosts = [],
}: {
  xHandle?: string
  linkedinProfileUrl?: string
  linkedinPosts?: LinkedInEmbed[]
}) {
  const xRef = useRef<HTMLDivElement>(null)
  const [xFailed, setXFailed] = useState(false)

  useEffect(() => {
    if (!xHandle) return
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://platform.x.com/widgets.js"]',
    )
    const load = () => window.twttr?.widgets?.load(xRef.current)
    if (existing) {
      load()
      return
    }
    const s = document.createElement('script')
    s.src = 'https://platform.x.com/widgets.js'
    s.async = true
    s.charset = 'utf-8'
    s.onload = load
    s.onerror = () => setXFailed(true)
    document.body.appendChild(s)
    // If the widget leaves the bare link after 6s, treat as blocked/failed.
    const t = setTimeout(() => {
      if (!xRef.current?.querySelector('iframe')) setXFailed(true)
    }, 6000)
    return () => clearTimeout(t)
  }, [xHandle])

  if (!xHandle && !linkedinProfileUrl && linkedinPosts.length === 0) return null

  return (
    <section id="latest" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-soft">
        Elsewhere
      </p>
      <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        Latest posts
      </h2>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {xHandle && (
          <div className="rounded-2xl border border-rule bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-mono text-xs uppercase tracking-widest text-ink-soft">
                On X
              </h3>
              <a
                href={`https://x.com/${xHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-coral-ink hover:underline"
              >
                @{xHandle} ↗
              </a>
            </div>
            <div ref={xRef} className="min-h-[12rem]">
              {xFailed ? (
                <p className="text-sm text-ink-soft">
                  The live timeline could not load here.{' '}
                  <a
                    className="text-coral-ink underline"
                    href={`https://x.com/${xHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read the latest posts on X
                  </a>
                  .
                </p>
              ) : (
                <a
                  className="twitter-timeline"
                  data-tweet-limit="5"
                  data-chrome="noheader nofooter noborders transparent"
                  href={`https://x.com/${xHandle}?ref_src=twsrc%5Etfw`}
                >
                  Posts by @{xHandle}
                </a>
              )}
            </div>
          </div>
        )}
        {linkedinProfileUrl && (
          <div className="rounded-2xl border border-rule bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-mono text-xs uppercase tracking-widest text-ink-soft">
                On LinkedIn
              </h3>
              <a
                href={linkedinProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-coral-ink hover:underline"
              >
                Profile ↗
              </a>
            </div>
            {linkedinPosts.length > 0 ? (
              <div className="flex flex-col gap-6">
                {linkedinPosts.map((p) => (
                  <iframe
                    key={p.urn}
                    src={`https://www.linkedin.com/embed/feed/update/${encodeURIComponent(p.urn)}`}
                    title={p.label ?? 'LinkedIn post'}
                    className="h-[570px] w-full border-0"
                    loading="lazy"
                    allowFullScreen
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-soft">
                <a
                  className="text-coral-ink underline"
                  href={linkedinProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read the latest posts on LinkedIn
                </a>
                .
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
