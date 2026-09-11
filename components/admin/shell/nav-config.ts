// components/admin/shell/nav-config.ts
//
// The admin's information architecture, as data. The sidebar, the breadcrumb
// trail and the "Create new" menu all read from here, so a route can never be
// present in one and missing from another — which is exactly how the previous
// header ended up linking to /admin/media, a page that did not exist.
//
// No 'use client': this is plain data, imported by both server and client files.

import {
  Briefcase,
  CalendarCheck,
  CalendarDays,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutTemplate,
  Mail,
  Palette,
  PenLine,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  /** Shown under the label when the sidebar is expanded. */
  hint: string
  /**
   * Treat `${href}/…` as this item too. On for section roots like /admin/site,
   * off for /admin itself — otherwise the dashboard would light up everywhere.
   */
  matchNested: boolean
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        href: '/admin',
        label: 'Dashboard',
        icon: LayoutDashboard,
        hint: 'Today at a glance',
        matchNested: false,
      },
    ],
  },
  {
    label: 'Content',
    items: [
      {
        href: '/admin/site',
        label: 'Site sections',
        icon: LayoutTemplate,
        hint: 'Every block on the homepage',
        matchNested: true,
      },
      {
        href: '/admin/pages',
        label: 'Custom pages',
        icon: LayoutTemplate,
        hint: 'Standalone pages for the nav',
        matchNested: true,
      },
      {
        href: '/admin/theme',
        label: 'Personalisation',
        icon: Palette,
        hint: 'Colour, type, layout, dark mode',
        matchNested: true,
      },
      {
        href: '/admin/media',
        label: 'Media library',
        icon: ImageIcon,
        hint: 'Files, photos, video, embeds',
        matchNested: true,
      },
      {
        href: '/admin/publishing',
        label: 'Publishing',
        icon: PenLine,
        hint: 'Blog posts and newsletters',
        matchNested: true,
      },
    ],
  },
  {
    label: 'Audience',
    items: [
      {
        href: '/admin/newsletter',
        label: 'Newsletter',
        icon: Mail,
        hint: 'Subscribers and campaigns',
        matchNested: true,
      },
    ],
  },
  {
    label: 'Business',
    items: [
      {
        href: '/admin/services',
        label: 'Services',
        icon: Briefcase,
        hint: 'Mentorship, reviews, pricing',
        matchNested: true,
      },
      {
        href: '/admin/bookings',
        label: 'Bookings',
        icon: CalendarCheck,
        hint: 'Who booked what, and paid',
        matchNested: true,
      },
      {
        href: '/admin/calendar',
        label: 'Availability',
        icon: CalendarDays,
        hint: 'When you can be booked',
        matchNested: true,
      },
    ],
  },
]

/** Flat view, for lookups that do not care about grouping. */
export const NAV_ITEMS: NavItem[] = NAV.flatMap((group) => group.items)

/** What the "Create new" menu offers. Ordered by how often it gets used. */
export const CREATE_ACTIONS: { href: string; label: string; hint: string }[] = [
  { href: '/admin/publishing/new', label: 'Post', hint: 'Blog entry or newsletter' },
  { href: '/admin/pages/new', label: 'Page', hint: 'Standalone custom page' },
  { href: '/admin/media?new=upload', label: 'Upload', hint: 'Image, PDF or video' },
  { href: '/admin/media?new=embed', label: 'Embed', hint: 'YouTube, Instagram, LinkedIn, map' },
  { href: '/admin/services/new', label: 'Service', hint: 'A new bookable offering' },
]

export function isActive(pathname: string, item: NavItem): boolean {
  if (pathname === item.href) return true
  return item.matchNested && pathname.startsWith(`${item.href}/`)
}

/** The nav item a path belongs to. Longest match wins, so /admin never shadows /admin/site. */
export function findNavItem(pathname: string): NavItem | null {
  let best: NavItem | null = null
  for (const item of NAV_ITEMS) {
    if (!isActive(pathname, item)) continue
    if (!best || item.href.length > best.href.length) best = item
  }
  return best
}

export interface Crumb {
  label: string
  href?: string
}

/**
 * Breadcrumbs for a path. The nav item supplies the first crumb; anything deeper
 * is a record id or a section key, which the page knows better than we do — so
 * pages pass `tail` (e.g. the post's title) rather than us humanising a slug and
 * showing "Q3 Roadmap" as "Q3 Roadmap" on a good day and "abc123" on a bad one.
 */
export function buildCrumbs(pathname: string, tail?: string): Crumb[] {
  const crumbs: Crumb[] = []
  const item = findNavItem(pathname)

  if (item && item.href !== '/admin') {
    crumbs.push({ label: 'Dashboard', href: '/admin' })
    crumbs.push(
      pathname === item.href ? { label: item.label } : { label: item.label, href: item.href }
    )
  } else {
    crumbs.push({ label: 'Dashboard' })
  }

  if (tail) crumbs.push({ label: tail })
  return crumbs
}
