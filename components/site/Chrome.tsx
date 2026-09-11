'use client'
// components/site/Chrome.tsx
//
// The furniture: status bar, sticky nav, footer. Client components because
// they need scroll position, a live clock, and a mobile menu — the rest of the
// page stays on the server.

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { FooterContent, Meta, NavContent, UtilityContent } from '@/types/site'

/* ------------------------------------------------------------ UtilityBar --- */

export function UtilityBar({ utility }: { utility: UtilityContent }) {
  // Rendered empty on the server and on first client paint: the page is
  // statically prerendered, so any time string baked at build would be both
  // wrong and a guaranteed hydration mismatch.
  const [clock, setClock] = useState<string | null>(null)

  useEffect(() => {
    const tick = () => {
      try {
        setClock(
          new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: utility.timezone || undefined,
          }).format(new Date())
        )
      } catch {
        setClock(null)
      }
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [utility.timezone])

  if (!utility.status && !utility.timezoneLabel) return null

  return (
    <div className="border-b border-rule/70 bg-paper-deep">
      <div className="gutter flex h-9 items-center justify-between gap-4">
        {utility.status ? (
          <p className="flex min-w-0 items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-ink-soft">
            <span
              aria-hidden="true"
              className="relative flex size-1.5 shrink-0"
            >
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-coral opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-coral-deep" />
            </span>
            <span className="truncate">{utility.status}</span>
          </p>
        ) : (
          <span />
        )}

        <p className="shrink-0 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-ink-soft">
          {utility.timezoneLabel}
          {clock ? <span className="ml-2 tabular-nums text-ink">{clock}</span> : null}
        </p>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- SiteNav --- */

export function SiteNav({ nav, resumeUrl }: { nav: NavContent; resumeUrl: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-rule bg-paper/85 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      )}
    >
      <nav className="gutter flex h-16 items-center justify-between gap-6">
        <a
          href="#top"
          className="font-display text-[1.02rem] font-semibold tracking-[-0.01em] text-ink"
        >
          {nav.brand}
          <span aria-hidden="true" className="text-coral">
            .
          </span>
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {nav.links.map((link) => (
            <li key={link.href + link.label}>
              <a
                href={link.href.startsWith('#') ? `/${link.href}` : link.href}
                target={link.newTab ? '_blank' : undefined}
                rel={link.newTab ? 'noopener noreferrer' : undefined}
                className="link-underline text-[0.88rem] text-ink-soft transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            </li>
          ))}
          {resumeUrl ? (
            <li>
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-[0.88rem] text-ink-soft transition-colors hover:text-ink"
              >
                Résumé
              </a>
            </li>
          ) : null}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={nav.cta.href}
            className="hidden rounded-full bg-coral-deep px-4 py-2 text-[0.85rem] font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-coral-ink sm:inline-flex"
          >
            {nav.cta.label}
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="grid size-10 place-items-center rounded-full ring-1 ring-rule md:hidden"
          >
            <span className="relative block h-3 w-4">
              <span
                className={cn(
                  'absolute left-0 h-px w-full bg-ink transition-all duration-300',
                  open ? 'top-1.5 rotate-45' : 'top-0'
                )}
              />
              <span
                className={cn(
                  'absolute left-0 h-px w-full bg-ink transition-all duration-300',
                  open ? 'top-1.5 -rotate-45' : 'top-3'
                )}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* mobile sheet */}
      <div
        className={cn(
          'overflow-hidden border-t border-rule bg-paper md:hidden',
          'transition-[max-height,opacity] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]',
          open ? 'max-h-[28rem] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <ul className="gutter flex flex-col py-3">
          {nav.links.map((link) => (
            <li key={link.href + link.label}>
              <a
                href={link.href.startsWith('#') ? `/${link.href}` : link.href}
                target={link.newTab ? '_blank' : undefined}
                rel={link.newTab ? 'noopener noreferrer' : undefined}
                onClick={() => setOpen(false)}
                className="block border-b border-rule/60 py-3 font-display text-lg text-ink"
              >
                {link.label}
              </a>
            </li>
          ))}
          {resumeUrl ? (
            <li>
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="block border-b border-rule/60 py-3 font-display text-lg text-ink"
              >
                Résumé
              </a>
            </li>
          ) : null}
          <li>
            <a
              href={nav.cta.href}
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex rounded-full bg-coral-deep px-5 py-2.5 text-[0.9rem] font-medium text-white"
            >
              {nav.cta.label}
            </a>
          </li>
        </ul>
      </div>
    </header>
  )
}

/* ---------------------------------------------------------------- Footer --- */

export function SiteFooter({
  footer,
  meta,
}: {
  footer: FooterContent
  meta: Meta
}) {
  const year = 2026 // static: a build-time new Date() would drift and mismatch

  return (
    <footer className="border-t border-rule bg-paper-deep">
      <div className="gutter flex flex-col gap-8 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-sm">
          <p className="font-display text-xl font-semibold tracking-[-0.01em] text-ink">
            {meta.name}
            <span aria-hidden="true" className="text-coral">
              .
            </span>
          </p>
          <p className="mt-2 text-[0.9rem] leading-relaxed text-ink-soft">{meta.descriptor}</p>
        </div>

        <div className="flex flex-col gap-4 sm:items-end">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {footer.links.map((link) => (
              <li key={link.href + link.label}>
                <a
                  href={link.href}
                  target={link.newTab ? '_blank' : undefined}
                  rel={link.newTab ? 'noopener noreferrer' : undefined}
                  className="link-underline text-[0.88rem] text-ink-soft hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
            {meta.resumeUrl ? (
              <li>
                <a
                  href={meta.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-[0.88rem] text-ink-soft hover:text-ink"
                >
                  Résumé
                </a>
              </li>
            ) : null}
          </ul>
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ink-soft/70">
            © {year} · {footer.colophon}
          </p>
        </div>
      </div>
    </footer>
  )
}
