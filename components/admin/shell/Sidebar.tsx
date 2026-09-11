'use client'
// components/admin/shell/Sidebar.tsx
//
// Collapse state arrives as a prop from the server (read from a cookie in
// app/admin/layout.tsx), so the first paint is already the right width. Keeping
// it in localStorage instead would mean rendering the expanded sidebar, then
// snapping it shut after hydration on every single page load.

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV, isActive } from './nav-config'

export const SIDEBAR_COOKIE = 'admin_sidebar'

export default function Sidebar({ initialCollapsed }: { initialCollapsed: boolean }) {
  const [collapsed, setCollapsed] = useState(initialCollapsed)
  const pathname = usePathname()

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    // One year, lax, path-scoped to /admin — it is a display preference, so it
    // has no business being sent with requests to the public site.
    document.cookie = `${SIDEBAR_COOKIE}=${next ? '1' : '0'}; path=/admin; max-age=31536000; samesite=lax`
  }

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-rule bg-paper-deep/45 transition-[width] duration-200 md:flex',
        collapsed ? 'w-[4.25rem]' : 'w-60'
      )}
    >
      <div
        className={cn(
          'flex h-14 items-center border-b border-rule px-3',
          collapsed ? 'justify-center' : 'justify-between'
        )}
      >
        {collapsed ? null : (
          <Link
            href="/admin"
            className="font-display text-[0.98rem] font-semibold tracking-[-0.02em] text-ink"
          >
            Command centre
          </Link>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="rounded-md p-1.5 text-ink-soft transition hover:bg-card hover:text-ink"
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        {NAV.map((group) => (
          <div key={group.label} className="mb-4 last:mb-0">
            {collapsed ? (
              <div className="mx-2 mb-2 border-t border-rule/70" aria-hidden />
            ) : (
              <p className="mb-1.5 px-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ink-soft/70">
                {group.label}
              </p>
            )}

            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'flex items-center gap-2.5 rounded-md px-2 py-2 transition',
                        collapsed && 'justify-center',
                        active
                          ? 'bg-card text-ink shadow-[inset_2px_0_0_0_var(--color-coral-deep)]'
                          : 'text-ink-soft hover:bg-card/70 hover:text-ink'
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {collapsed ? (
                        <span className="sr-only">{item.label}</span>
                      ) : (
                        <span className="min-w-0">
                          <span className="block truncate text-[0.86rem] font-medium leading-tight">
                            {item.label}
                          </span>
                          <span className="block truncate text-[0.7rem] leading-tight text-ink-soft/75">
                            {item.hint}
                          </span>
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
