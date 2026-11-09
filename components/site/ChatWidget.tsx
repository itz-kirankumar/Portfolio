'use client'
// components/site/ChatWidget.tsx
//
// A small visitor assistant pinned to the bottom-right of every page. It is
// deliberately not an LLM: every answer is assembled from the site's own
// public content (works, writing index, services page, contact details), so
// it can never leak private material or invent facts. Unknown questions get
// an honest fallback with Kiran's email.

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { DEFAULT_WORKS } from '@/lib/default-works'

type Msg = { from: 'bot' | 'me'; text: string; links?: { href: string; label: string }[]; choices?: string[] }

const RESUME_VARIANTS = ['Product Manager', "Founder's Office / Strategy", 'Technical']

/** Visitor-selectable résumé PDFs (public files under /resumes). */
const RESUME_URLS: Record<string, string> = {
  'Product Manager': '/resumes/kiran-kumar-g-product-manager.pdf',
  "Founder's Office / Strategy": '/resumes/kiran-kumar-g-founders-office-strategy.pdf',
  Technical: '/resumes/kiran-kumar-g-technical.pdf',
}

const STOP = new Set(['the', 'a', 'an', 'of', 'and', 'or', 'to', 'in', 'on', 'for', 'is', 'it', 'his', 'he', 'what', 'who', 'how', 'does', 'do', 'did', 'about', 'me', 'my', 'you', 'your', 'kiran', 'kumar', 'tell', 'show', 'with', 'has', 'have', 'that', 'this', 'at', 'by'])

function tokens(q: string): string[] {
  return q.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((t) => t && !STOP.has(t))
}

function answer(q: string, resumeUrl: string, email: string): Msg {
  const lower = q.toLowerCase()

  const pickedVariant = RESUME_VARIANTS.find((v) => lower === v.toLowerCase())
  if (pickedVariant) {
    const url = RESUME_URLS[pickedVariant] || resumeUrl
    return url
      ? { from: 'bot', text: `Here is Kiran's ${pickedVariant} résumé (PDF).`, links: [{ href: url, label: `Download ${pickedVariant} résumé` }] }
      : { from: 'bot', text: `The ${pickedVariant} résumé PDF is being finalized and isn't published yet. Email Kiran and he will send it: ${email}`, links: [{ href: `mailto:${email}?subject=${encodeURIComponent(`Résumé request (${pickedVariant})`)}`, label: 'Email Kiran' }] }
  }
  if (/resume|résumé|cv/.test(lower)) {
    return {
      from: 'bot',
      text: "Kiran keeps three résumé versions. Which one should I get you?",
      choices: RESUME_VARIANTS,
    }
  }
  if (/contact|email|hire|work with|talk|reach/.test(lower)) {
    return { from: 'bot', text: `The fastest way to reach Kiran is email: ${email}. The contact section on the homepage has the same details.`, links: [{ href: `mailto:${email}`, label: 'Email Kiran' }, { href: '/#contact', label: 'Contact section' }] }
  }
  if (/service|consult|offer|price|pricing|book/.test(lower)) {
    return { from: 'bot', text: 'Kiran offers product and strategy services — details and booking live on the services page.', links: [{ href: '/services', label: 'See services' }] }
  }
  if (/writing|article|blog|canvas|newsletter|post/.test(lower)) {
    return { from: 'bot', text: 'Kiran writes The Indian Canvas series and essays on the writing page — new pieces appear there automatically as they publish.', links: [{ href: '/writing', label: 'Read the writing' }] }
  }
  if (/who|background|bio|about|operator|education|masters/.test(lower)) {
    return { from: 'bot', text: 'Kiran is a 0→1 operator across strategy, GTM and AI, based in Gurgaon, India. The about section on the homepage has the full picture.', links: [{ href: '/#about', label: 'About Kiran' }] }
  }

  const ts = tokens(q)
  if (ts.length) {
    const scored = DEFAULT_WORKS.map((w) => {
      const hay = `${w.title} ${w.kind} ${w.summary}`.toLowerCase()
      const score = ts.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0)
      return { w, score }
    }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 3)
    if (scored.length) {
      return {
        from: 'bot',
        text: scored.length === 1 && scored[0].score >= 2
          ? `${scored[0].w.title}: ${scored[0].w.summary}`
          : 'Closest matches from Kiran\'s public work:',
        links: scored.map(({ w }) => ({ href: `/work/${w.slug}`, label: w.title })),
      }
    }
  }
  if (/built|build|project|venture|work/.test(lower)) {
    return { from: 'bot', text: `Kiran's ventures, products, tools and research each have a story page — ${DEFAULT_WORKS.length} of them on the works index.`, links: [{ href: '/work', label: 'Browse all works' }] }
  }
  return { from: 'bot', text: `I can answer from what's public on this site — Kiran's work, writing, services and contact. For anything else, email him directly: ${email}`, links: [{ href: `mailto:${email}`, label: 'Email Kiran' }] }
}

export function ChatWidget({ resumeUrl, email }: { resumeUrl: string; email: string }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: 'bot', text: "Hi! Ask me anything about Kiran — his work, writing, services, or grab his résumé. I answer from the public content of this site." },
  ])
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, open])

  const send = (text: string) => {
    const q = text.trim()
    if (!q) return
    setMsgs((m) => [...m, { from: 'me', text: q }, answer(q, resumeUrl, email)])
    setInput('')
  }

  const chips = ['What has Kiran built?', 'Writing', 'Services', 'Résumé', 'Contact']

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat' : 'Ask about Kiran'}
        className="fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-coral text-paper-deep shadow-lg shadow-black/40 transition hover:bg-coral-deep focus-visible:outline-2 focus-visible:outline-coral-ink"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 5h16v11H9l-5 4V5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Ask about Kiran"
          className="fixed bottom-[5.5rem] right-5 z-[70] flex h-[28rem] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-rule bg-card shadow-2xl shadow-black/50"
        >
          <div className="border-b border-rule bg-paper-deep px-4 py-3">
            <p className="font-display text-sm font-bold text-ink">Ask about Kiran</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-soft">answers from this site's public content</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {msgs.map((m, i) => (
              <div key={i} className={m.from === 'me' ? 'text-right' : ''}>
                <div
                  className={
                    m.from === 'me'
                      ? 'inline-block max-w-[85%] rounded-2xl rounded-br-sm bg-coral px-3 py-2 text-left text-sm text-paper-deep'
                      : 'inline-block max-w-[85%] rounded-2xl rounded-bl-sm bg-paper-deep px-3 py-2 text-sm text-ink'
                  }
                >
                  {m.text}
                </div>
                {m.choices && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {m.choices.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => send(c)}
                        className="rounded-full border border-coral/40 px-2.5 py-1 font-mono text-[11px] text-coral-ink transition hover:bg-coral-soft"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
                {m.links && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {m.links.map((l) => (
                      <Link
                        key={l.href + l.label}
                        href={l.href}
                        target={l.href.startsWith('http') || l.href.endsWith('.pdf') ? '_blank' : undefined}
                        className="rounded-full border border-coral/40 px-2.5 py-1 font-mono text-[11px] text-coral-ink transition hover:bg-coral-soft"
                      >
                        {l.label} →
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="flex flex-wrap gap-1.5 px-3 pb-2">
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => send(c)}
                className="rounded-full border border-rule px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-ink-soft transition hover:border-coral hover:text-coral-ink"
              >
                {c}
              </button>
            ))}
          </div>

          <form
            className="flex items-center gap-2 border-t border-rule px-3 py-2.5"
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Kiran…"
              aria-label="Ask about Kiran"
              className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Send"
              className="rounded-full bg-coral px-3 py-1.5 text-sm font-medium text-paper-deep transition hover:bg-coral-deep"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  )
}
