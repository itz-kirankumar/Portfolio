'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Analytics } from '@vercel/analytics/next'
import { cleanPath, privatePath, type EventName } from '@/lib/analytics-policy'

declare global {
  interface Window {
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] }
    portfolioEvent?: (name: EventName, props?: Record<string, string | number>) => void
  }
}

const CONSENT_KEY = 'portfolio-analytics-consent'
const replayPrivate = (path: string) => privatePath(path) || path.includes('/book')

export function Tracker() {
  const pathname = usePathname() || '/'
  const [allowed, setAllowed] = useState(false)
  const [ask, setAsk] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    if (privatePath(pathname)) return
    const params = new URLSearchParams(location.search)
    if (params.get('analytics') === 'off') localStorage.setItem('portfolio-analytics-exclude', '1')
    if (localStorage.getItem('portfolio-analytics-exclude') || navigator.webdriver || navigator.doNotTrack === '1') return
    fetch('/api/analytics/status', { cache: 'no-store' }).then(r => r.json()).then(async config => {
      if (!alive || config.excluded) return
      setReady(true)
      const choice = localStorage.getItem(CONSENT_KEY)
      setAsk(!choice)
      if (choice !== 'yes') return
      setAllowed(true)
      // Replay loads only after consent, never on admin/preview/checkout.
      if (!window.clarity && !replayPrivate(location.pathname) && !location.search && !location.hash) {
        const c = ((...args: unknown[]) => { (c.q = c.q || []).push(args) }) as NonNullable<Window['clarity']>
        window.clarity = c
        c('consentv2', { analytics_Storage: 'granted', ad_Storage: 'denied' })
        const script = document.createElement('script')
        script.src = 'https://www.clarity.ms/tag/zath09upbe'
        script.async = true
        document.head.appendChild(script)
      }
    }).catch(() => {})
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (!allowed || privatePath(pathname)) return
    let sessionId = sessionStorage.getItem('portfolio-analytics-session')
    if (!sessionId) { sessionId = crypto.randomUUID(); sessionStorage.setItem('portfolio-analytics-session', sessionId) }
    const path = cleanPath(pathname)
    const send = (name: EventName, props: Record<string, string | number> = {}) => {
      if (privatePath(location.pathname)) return
      const event = { name, path, props, sessionId }
      fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(event), keepalive: true }).catch(() => {})
      window.clarity?.('event', name)
    }
    window.portfolioEvent = send
    let referrer = ''
    try { referrer = new URL(document.referrer).hostname } catch {}
    send('page_view', { referrer })
    if (/^\/work\/.+/.test(path)) send('project_view')
    if (/^\/(writing|p)\/.+/.test(path)) send('article_view')
    if (/^\/services\/.+\/book$/.test(path)) send('booking_view')
    else if (/^\/services\/.+/.test(path)) send('service_view')
    const seen = new Set<number>()
    const scroll = () => {
      const total = document.documentElement.scrollHeight - innerHeight
      const pct = total > 0 ? Math.min(100, Math.round(scrollY / total * 100)) : 100
      for (const threshold of [25, 50, 75, 100]) if (pct >= threshold && !seen.has(threshold)) { seen.add(threshold); send('reading_depth', { percent: threshold }) }
    }
    let seconds = 0
    let lastAction = Date.now()
    const activity = () => { lastAction = Date.now() }
    for (const event of ['pointerdown', 'keydown', 'scroll']) window.addEventListener(event, activity, { passive: true })
    const timer = setInterval(() => { if (document.visibilityState === 'visible' && Date.now() - lastAction < 30000) { seconds += 1; if ([15, 30, 60, 120, 300].includes(seconds)) send('engaged_time', { seconds }) } }, 1000)
    const click = (e: MouseEvent) => {
      const target = e.target as Element
      const a = target.closest('a')
      if (!a) { if (target.closest('button[aria-label="Open chat"]')) send('chat_open'); return }
      const url = new URL(a.href, location.href)
      if (/\/resumes\/|\.pdf$/i.test(url.pathname)) send('resume_download', { target: url.pathname })
      else if (/^(mailto:|tel:)/.test(url.protocol)) send('contact_click', { target: url.protocol.replace(':', '') })
      else if (url.hostname === 'github.com') send('source_click', { target: url.hostname + url.pathname })
      else if (url.origin === location.origin && /^\/work\/.+/.test(url.pathname)) send('project_click', { target: url.pathname })
      else if (url.origin !== location.origin) send('outbound_click', { target: url.hostname })
    }
    const submit = (e: Event) => {
      const form = e.target as HTMLFormElement
      if (form.querySelector('input[name="startMs"]')) send('booking_submit')
      else if (form.querySelector('input[type="email"]') && !form.querySelector('input[name="name"]')) send('newsletter_submit')
    }
    // Crossing into a private surface must be a new document so a previously
    // loaded replay SDK cannot observe an SPA-rendered admin/receipt page.
    const privateNavigation = (e: MouseEvent) => {
      const a = (e.target as Element).closest('a')
      if (a && a.origin === location.origin && replayPrivate(a.pathname)) { e.preventDefault(); location.assign(a.href) }
    }
    document.addEventListener('click', click)
    document.addEventListener('click', privateNavigation, true)
    document.addEventListener('submit', submit)
    window.addEventListener('scroll', scroll, { passive: true })
    return () => { for (const event of ['pointerdown', 'keydown', 'scroll']) window.removeEventListener(event, activity); delete window.portfolioEvent; clearInterval(timer); document.removeEventListener('click', click); document.removeEventListener('click', privateNavigation, true); document.removeEventListener('submit', submit); window.removeEventListener('scroll', scroll) }
  }, [allowed, pathname])

  // Covers programmatic routing (including browser back/forward) as well.
  useEffect(() => { if (allowed && window.clarity && replayPrivate(pathname)) location.reload() }, [allowed, pathname])

  return <>
    {allowed && !privatePath(pathname) && <Analytics beforeSend={event => {
      if (privatePath(new URL(event.url).pathname)) return null
      return { ...event, url: new URL(event.url).origin + cleanPath(new URL(event.url).pathname) }
    }} />}
    {ready && ask && <aside aria-label="Analytics preferences" className="fixed bottom-4 left-4 z-50 max-w-sm rounded-xl border border-rule bg-card p-4 text-sm text-ink shadow-lg" data-clarity-mask="true">
      <p>Allow anonymous analytics and masked session recordings to help improve this site? Form entries are never included.</p>
      <div className="mt-3 flex gap-3">
        <button className="rounded-md bg-coral-deep px-3 py-2 text-white" onClick={() => { localStorage.setItem(CONSENT_KEY, 'yes'); location.reload() }}>Allow analytics</button>
        <button className="px-3 py-2" onClick={() => { localStorage.setItem(CONSENT_KEY, 'no'); setAsk(false) }}>No thanks</button>
      </div>
    </aside>}
    {ready && !ask && !privatePath(pathname) && <button className="fixed bottom-2 left-2 z-40 rounded border border-rule bg-card px-2 py-1 text-[10px] text-ink-soft" onClick={() => { window.clarity?.('consentv2', { analytics_Storage: 'denied', ad_Storage: 'denied' }); window.clarity?.('stop'); localStorage.removeItem(CONSENT_KEY); sessionStorage.removeItem('portfolio-analytics-session'); location.reload() }}>Privacy settings</button>}
  </>
}
