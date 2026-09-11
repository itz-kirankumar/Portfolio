'use client'
// components/admin/shell/Topbar.tsx
//
// Breadcrumbs, the escape hatch to the live site, the create menu, and the
// account menu. Also owns the mobile navigation, since Sidebar is md-and-up:
// without this the panel would have no nav at all on a phone.

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ChevronRight, ExternalLink, LogOut, Menu, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BTN, GHOST_BTN } from '@/components/admin/ui'
import { CREATE_ACTIONS, NAV, buildCrumbs, isActive } from './nav-config'

/** Closes a popover on outside click and Escape. Both, because either alone feels broken. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  return ref
}

function CreateMenu() {
  const [open, setOpen] = useState(false)
  const ref = useDismiss(open, () => setOpen(false))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(BTN, 'px-2.5')}
      >
        <Plus className="size-3.5" />
        <span className="hidden sm:inline">Create</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-1.5 w-60 overflow-hidden rounded-lg border border-rule bg-card shadow-lg"
        >
          {CREATE_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block border-b border-rule/60 px-3.5 py-2.5 transition last:border-b-0 hover:bg-paper-deep/60"
            >
              <span className="block text-[0.86rem] font-medium text-ink">{action.label}</span>
              <span className="block text-[0.74rem] leading-snug text-ink-soft">{action.hint}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function AccountMenu({ email, name }: { email: string; name: string }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const ref = useDismiss(open, () => setOpen(false))

  const initial = (name || email || '?').trim().charAt(0).toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account"
        className="grid size-8 place-items-center rounded-full border border-rule bg-paper-deep font-display text-[0.82rem] font-semibold text-ink transition hover:border-ink-soft"
      >
        {initial}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-1.5 w-60 overflow-hidden rounded-lg border border-rule bg-card shadow-lg"
        >
          <div className="border-b border-rule/60 px-3.5 py-2.5">
            {name ? <p className="text-[0.86rem] font-medium text-ink">{name}</p> : null}
            <p className="truncate font-mono text-[0.7rem] text-ink-soft">{email}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            disabled={busy}
            onClick={() => {
              setBusy(true)
              void signOut({ callbackUrl: '/' })
            }}
            className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[0.86rem] text-ink transition hover:bg-paper-deep/60 disabled:opacity-50"
          >
            <LogOut className="size-3.5 text-ink-soft" />
            {busy ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      ) : null}
    </div>
  )
}

function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Navigating should dismiss it — otherwise the sheet covers the page you just
  // asked for.
  useEffect(() => setOpen(false), [pathname])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className={cn(GHOST_BTN, 'md:hidden')}
      >
        <Menu className="size-4" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-deep/45 backdrop-blur-sm"
          />
          <nav className="absolute inset-y-0 left-0 w-[min(82vw,17rem)] overflow-y-auto border-r border-rule bg-paper px-3 py-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-[0.98rem] font-semibold text-ink">
                Command centre
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className={GHOST_BTN}
              >
                <X className="size-3.5" />
              </button>
            </div>

            {NAV.map((group) => (
              <div key={group.label} className="mb-4">
                <p className="mb-1.5 px-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ink-soft/70">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={isActive(pathname, item) ? 'page' : undefined}
                          className={cn(
                            'flex items-center gap-2.5 rounded-md px-2 py-2 text-[0.88rem] transition',
                            isActive(pathname, item)
                              ? 'bg-card font-medium text-ink'
                              : 'text-ink-soft hover:text-ink'
                          )}
                        >
                          <Icon className="size-4 shrink-0" />
                          {item.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      ) : null}
    </>
  )
}

export default function Topbar({ email, name }: { email: string; name: string }) {
  const pathname = usePathname()
  const crumbs = buildCrumbs(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-rule bg-paper/88 px-4 backdrop-blur-md sm:px-6">
      <MobileNav />

      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex items-center gap-1 text-[0.85rem]">
          {crumbs.map((crumb, i) => (
            <li key={`${crumb.label}-${i}`} className="flex min-w-0 items-center gap-1">
              {i > 0 ? <ChevronRight className="size-3 shrink-0 text-ink-soft/50" /> : null}
              {crumb.href ? (
                <Link href={crumb.href} className="truncate text-ink-soft transition hover:text-ink">
                  {crumb.label}
                </Link>
              ) : (
                <span className="truncate font-medium text-ink" aria-current="page">
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(BTN, 'px-2.5')}
          title="Open the live site in a new tab"
        >
          <ExternalLink className="size-3.5" />
          <span className="hidden sm:inline">Preview site</span>
        </a>

        <CreateMenu />
        <AccountMenu email={email} name={name} />
      </div>
    </header>
  )
}
