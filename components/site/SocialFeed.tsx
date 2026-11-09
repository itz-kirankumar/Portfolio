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
  /** Post URN, e.g. urn:li:activity:7518994437042044928 */
  urn: string
  label?: string
  /** Display date, e.g. "Oct 22, 2026" */
  date?: string
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
    // If the widget leaves the bare link after 6s, or its timeline iframe
    // renders collapsed (X rate-limits some IPs to a 0-height shell), treat
    // as failed and collapse to a compact profile card.
    const t = setTimeout(() => {
      const frame = xRef.current?.querySelector<HTMLIFrameElement>(
        'iframe[src*="syndication.twitter.com"]',
      )
      const h = frame?.getBoundingClientRect().height ?? 0
      if (!frame || h < 100) setXFailed(true)
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
        Around the web
      </h2>
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-2">
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
            <div ref={xRef}>
              {xFailed ? (
                <a
                  href={`https://x.com/${xHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-xl border border-rule bg-paper-deep/40 px-4 py-3 transition hover:border-coral/50"
                >
                  <span className="text-sm text-ink">Latest posts on X</span>
                  <span className="font-mono text-xs text-coral-ink">
                    @{xHandle} ↗
                  </span>
                </a>
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
                Selected LinkedIn posts
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
                  <div key={p.urn}>
                    <p className="mb-2 font-mono text-[11px] text-ink-soft">
                      {p.label}
                      {p.date ? ` - ${p.date}` : ''}
                    </p>
                    <iframe
                      src={`https://www.linkedin.com/embed/feed/update/${encodeURIComponent(p.urn)}`}
                      title={p.label ?? 'LinkedIn post'}
                      className="h-[570px] w-full border-0"
                      loading="lazy"
                      allowFullScreen
                    />
                  </div>
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
