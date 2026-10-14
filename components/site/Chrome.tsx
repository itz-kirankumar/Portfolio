'use client'
// components/site/Chrome.tsx
//
// The furniture: status bar, sticky nav, footer. Client components because
// they need scroll position, a live clock, a mobile menu — and the nav needs
// the current pathname so links resolve correctly from nested routes like
// /writing/[slug]. The rest of the page stays on the server.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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

function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement
    if (root.classList.contains('dark')) {
      root.classList.remove('dark')
      localStorage.theme = 'light'
    } else {
      root.classList.add('dark')
      localStorage.theme = 'dark'
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="grid size-9 place-items-center rounded-full text-ink-soft hover:bg-rule/50 hover:text-ink transition-colors"
    >
      <svg className="theme-toggle-light" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l-1.4 1.4M18.4 5.6l-1.4-1.4"/></svg>
      <svg className="theme-toggle-dark" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    </button>
  )
}

/* --- nav link resolution ---------------------------------------------------
   Stored hrefs come from /admin and take four shapes:
     '#contact'      a bare in-page anchor (legacy / CTA)
     '/#writing'     a home-page section
     '/services'     a real route
     'https://…'     an external link
   The old nav only prefixed the `links` array, so the logo ('#top') and the
   CTA ('#contact') produced dead `/writing/[slug]#…` anchors on nested routes.
   These helpers normalise every shape so it resolves from any page. */

function isExternal(href: string) {
  return /^https?:|^mailto:|^tel:/.test(href)
}

/** Section anchors that have graduated to a dedicated page: the nav should
    open that page, not scroll to the home-page teaser of the same name. The
    stored nav still says '/#writing' (it lives in Firestore, not here), so the
    remap happens at render time and needs no content edit. */
const SECTION_ROUTES: Record<string, string> = {
  '/#writing': '/writing',
}

/** Bare '#anchor' → '/#anchor' so it points at the home page from anywhere,
    then redirect any anchor that now has a real page of its own. */
function normalizeHref(href: string) {
  const withSlash = href.startsWith('#') ? `/${href}` : href
  return SECTION_ROUTES[withSlash] ?? withSlash
}

/** True when the link is the route the visitor is currently on. Home-page
    section anchors are never "page active" — they are parts of '/'. */
function isActivePage(href: string, pathname: string) {
  if (isExternal(href)) return false
  const norm = normalizeHref(href)
  if (norm === '/' || norm.startsWith('/#') || norm.startsWith('#')) return false
  const base = norm.split('#')[0].replace(/\/+$/, '') || '/'
  return pathname === base || pathname.startsWith(base + '/')
}

function SiteNavLink({
  href,
  label,
  newTab,
  variant,
  pathname,
  onNavigate,
  prominent = false,
}: {
  href: string
  label: React.ReactNode
  newTab?: boolean
  variant: 'desktop' | 'mobile'
  pathname: string
  onNavigate?: () => void
  prominent?: boolean
}) {
  const onHome = pathname === '/'
  const external = isExternal(href) || newTab
  const active = isActivePage(href, pathname)
  const norm = normalizeHref(href)
  const samePageAnchor = onHome && norm.startsWith('/#')

  const base = prominent
    ? variant === 'desktop'
      ? 'hidden items-center rounded-full bg-coral-deep px-4 py-2 text-[0.85rem] font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-coral-ink sm:inline-flex'
      : 'mt-4 inline-flex w-fit rounded-full bg-coral-deep px-5 py-2.5 text-[0.9rem] font-medium text-white'
    : variant === 'desktop'
      ? 'relative text-[0.88rem] transition-colors'
      : 'block border-b border-rule/60 py-3 font-display text-lg transition-colors'

  const toneClass = prominent
    ? ''
    : active
      ? variant === 'desktop'
        ? 'font-medium text-ink'
        : 'font-medium text-coral-ink'
      : variant === 'desktop'
        ? 'text-ink-soft hover:text-ink'
        : 'text-ink hover:text-coral-ink'

  const className = cn(
    !prominent && !active && variant === 'desktop' && 'link-underline',
    base,
    prominent && 'text-white',
    toneClass
  )
  const onClick = variant === 'mobile' ? onNavigate : undefined

  const underline =
    active && variant === 'desktop' && !prominent ? (
      <span
        aria-hidden="true"
        className="absolute -bottom-1.5 left-0 h-[2px] w-full rounded-full bg-coral"
      />
    ) : null

  if (external) {
    return (
      <a
        href={isExternal(href) ? href : norm}
        target={newTab || href.startsWith('http') ? '_blank' : undefined}
        rel={newTab || href.startsWith('http') ? 'noopener noreferrer' : undefined}
        onClick={onClick}
        className={className}
      >
        {label}
        {underline}
      </a>
    )
  }

  if (samePageAnchor) {
    return (
      <a href={norm.slice(1)} onClick={onClick} className={className}>
        {label}
        {underline}
      </a>
    )
  }

  return (
    <Link
      href={norm}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={className}
    >
      {label}
      {underline}
    </Link>
  )
}

export function SiteNav({ nav, resumeUrl, showThemeToggle }: { nav: NavContent; resumeUrl: string, showThemeToggle?: boolean }) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  const onHome = pathname === '/'

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

  const brandMark = (
    <>
      {nav.brand}
      <span aria-hidden="true" className="text-coral">
        .
      </span>
    </>
  )

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
        {/* Logo: scroll to top on the home page, otherwise route home. */}
        {onHome ? (
          <a
            href="#top"
            aria-label="Back to top"
            className="font-display text-[1.02rem] font-semibold tracking-[-0.01em] text-ink"
          >
            {brandMark}
          </a>
        ) : (
          <Link
            href="/"
            aria-label="Home"
            className="font-display text-[1.02rem] font-semibold tracking-[-0.01em] text-ink"
          >
            {brandMark}
          </Link>
        )}

        <ul className="hidden items-center gap-7 md:flex">
          {nav.links.map((link) => (
            <li key={link.href + link.label}>
              <SiteNavLink href={link.href} label={link.label} newTab={link.newTab} variant="desktop" pathname={pathname} />
            </li>
          ))}
          {resumeUrl ? (
            <li>
              <SiteNavLink href={resumeUrl} label="Résumé" newTab variant="desktop" pathname={pathname} />
            </li>
          ) : null}
        </ul>

        <div className="flex items-center gap-2">
          {showThemeToggle && <ThemeToggle />}
          <SiteNavLink
            href={nav.cta.href}
            label={nav.cta.label}
            newTab={nav.cta.newTab}
            variant="desktop"
            pathname={pathname}
            prominent
          />

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
        aria-hidden={!open}
        inert={!open}
        className={cn(
          'max-h-[calc(100dvh-4rem)] overflow-x-hidden overflow-y-auto border-t border-rule bg-paper md:hidden',
          'transition-[max-height,opacity] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]',
          open ? 'max-h-[calc(100dvh-4rem)] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <ul className="gutter flex flex-col py-3">
          {nav.links.map((link) => (
            <li key={link.href + link.label}>
              <SiteNavLink href={link.href} label={link.label} newTab={link.newTab} variant="mobile" pathname={pathname} onNavigate={() => setOpen(false)} />
            </li>
          ))}
          {resumeUrl ? (
            <li>
              <SiteNavLink href={resumeUrl} label="Résumé" newTab variant="mobile" pathname={pathname} onNavigate={() => setOpen(false)} />
            </li>
          ) : null}
          <li>
            <SiteNavLink
              href={nav.cta.href}
              label={nav.cta.label}
              newTab={nav.cta.newTab}
              variant="mobile"
              pathname={pathname}
              onNavigate={() => setOpen(false)}
              prominent
            />
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
