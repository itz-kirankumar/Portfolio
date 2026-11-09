'use client'

// "Around the web" section. X uses the official free timeline embed (public
// posts, auto-updating, capped at 3, site-dark theme). When X's syndication
// service refuses to serve (it rate-limits some IPs), the card collapses to
// a compact profile link instead of a blank shell. LinkedIn has no free
// automated profile feed, so its side is a curated pair of site-styled cards
// with real excerpts, dates, and source links - never labeled "latest".

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    twttr?: { widgets?: { load: (el?: HTMLElement | null) => void } }
  }
}

export type LinkedInPostCard = {
  title: string
  date: string
  excerpt: string
  url: string
}

export function SocialFeed({
  xHandle,
  linkedinProfileUrl,
  linkedinPosts = [],
}: {
  xHandle?: string
  linkedinProfileUrl?: string
  linkedinPosts?: LinkedInPostCard[]
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
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-2">
        {xHandle && (
          <div className="rounded-2xl border border-rule bg-card p-5">
            {cardHead('On X', `https://x.com/${xHandle}`, `@${xHandle}`)}
            <div ref={xRef}>
              {xFailed ? (
                <a
                  href={`https://x.com/${xHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-3 rounded-xl border border-rule bg-paper-deep/40 px-4 py-4 transition hover:border-coral/50"
                >
                  <span className="text-sm text-ink">Latest posts on X</span>
                  <span className="font-mono text-xs text-coral-ink">
                    @{xHandle} ↗
                  </span>
                </a>
              ) : (
                <a
                  className="twitter-timeline"
                  data-theme="dark"
                  data-tweet-limit="3"
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
            {cardHead('Selected LinkedIn posts', linkedinProfileUrl, 'Profile')}
            <div className="flex flex-col gap-4">
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
