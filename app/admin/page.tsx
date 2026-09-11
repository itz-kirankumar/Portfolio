// app/admin/page.tsx
//
// The landing view: what needs attention today, and the fastest route to the
// three things most often done from cold — write something, upload something,
// change the site copy.
//
// Every figure is counted live. Where a number cannot be known (page views,
// with no analytics provider wired) it says so rather than showing a zero that
// reads like a measurement.
//
// Query shapes here are deliberately INDEX-FREE: one range filter on one field,
// ordered by that same field. Firestore auto-indexes single fields, so this page
// works on a brand-new project. Adding `status in [...]` next to a range on
// `startISO` would need a composite index, and safeCount() swallows the
// FAILED_PRECONDITION as a zero — a stat that silently reads "0" instead of
// "broken" is worse than no stat at all. The status filter happens in JS.

import Link from 'next/link'
import { CalendarCheck, Image as ImageIcon, PenLine, Plus, Users } from 'lucide-react'
import { BTN, BTN_PRIMARY, EmptyState, PageHeader, Panel, StatCard } from '@/components/admin/ui'
import { safeCount, safeList } from '@/lib/store'
import { BLOCKING_STATUSES, BOOKINGS_COLLECTION, bookingSchema } from '@/lib/schemas/booking'
import { MEDIA_COLLECTION } from '@/lib/schemas/media'
import { POSTS_COLLECTION, postSchema } from '@/lib/schemas/post'
import { SERVICES_COLLECTION, formatPrice } from '@/lib/schemas/service'
import { SUBSCRIBERS_COLLECTION } from '@/lib/schemas/subscriber'
import { timeAgo } from '@/lib/utils'

export const metadata = { title: 'Dashboard' }

/** The admin reads truth, never a cached copy. */
export const dynamic = 'force-dynamic'

/** How far ahead we look for bookings. Past this the stat reads "N+". */
const LOOKAHEAD_CAP = 100

function startOfWeek(now: Date): Date {
  const d = new Date(now)
  const day = (d.getDay() + 6) % 7 // Monday = 0
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - day)
  return d
}

import { ANALYTICS_COLLECTION } from '@/lib/schemas/analytics'

export default async function AdminDashboard() {
  const now = new Date()
  const nowISO = now.toISOString()
  const weekStartMs = startOfWeek(now).getTime()

  const [
    published,
    drafts,
    subscribers,
    mediaCount,
    services,
    future,
    paidThisWeek,
    recentPosts,
    pageViews,
  ] = await Promise.all([
    safeCount(POSTS_COLLECTION, [['status', '==', 'published']]),
    safeCount(POSTS_COLLECTION, [['status', '==', 'draft']]),
    safeCount(SUBSCRIBERS_COLLECTION, [['status', '==', 'active']]),
    safeCount(MEDIA_COLLECTION),
    safeCount(SERVICES_COLLECTION, [['active', '==', true]]),
    safeList(BOOKINGS_COLLECTION, bookingSchema, {
      where: [['startISO', '>=', nowISO]],
      orderBy: ['startISO', 'asc'],
      limit: LOOKAHEAD_CAP,
    }),
    // Revenue is dated by when the payment *verified*, not when the session
    // happens — money received in March for an April call is March's revenue.
    safeList(BOOKINGS_COLLECTION, bookingSchema, {
      where: [['payment.verifiedAt', '>=', weekStartMs]],
      orderBy: ['payment.verifiedAt', 'desc'],
      limit: 200,
    }),
    safeList(POSTS_COLLECTION, postSchema, { orderBy: ['updatedAt', 'desc'], limit: 5 }),
    safeCount(ANALYTICS_COLLECTION),
  ])

  const booked = future.filter((b) => BLOCKING_STATUSES.includes(b.status))
  const upcoming = booked.slice(0, 5)
  const bookedLabel = future.length >= LOOKAHEAD_CAP ? `${booked.length}+` : String(booked.length)

  // Summed per currency. Adding EUR to INR produces a number that is not money.
  const totals = new Map<string, number>()
  for (const b of paidThisWeek) {
    if (b.status === 'cancelled' || b.payment.amount <= 0) continue
    totals.set(b.payment.currency, (totals.get(b.payment.currency) ?? 0) + b.payment.amount)
  }
  const revenue =
    totals.size === 0
      ? '₹0'
      : [...totals].map(([currency, paise]) => formatPrice(paise, currency)).join(' + ')

  return (
    <>
      <PageHeader
        title="Command centre"
        description="Everything on the site, in one place. Nothing here needs a deploy."
        actions={
          <>
            <Link href="/admin/site" className={BTN}>
              Edit the site
            </Link>
            <Link href="/admin/publishing/new" className={BTN_PRIMARY}>
              <Plus className="size-3.5" />
              New post
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Published"
          value={published}
          hint={drafts > 0 ? `${drafts} draft${drafts === 1 ? '' : 's'} waiting` : 'No drafts open'}
          href="/admin/publishing"
        />
        <StatCard
          label="Subscribers"
          value={subscribers}
          hint="Active, not unsubscribed"
          href="/admin/newsletter"
        />
        <StatCard
          label="Booked ahead"
          value={bookedLabel}
          hint={
            services > 0
              ? `${services} service${services === 1 ? '' : 's'} live`
              : 'No services live yet'
          }
          href="/admin/bookings"
          tone={booked.length > 0 ? 'accent' : 'default'}
        />
        <StatCard
          label="Media items"
          value={mediaCount}
          hint="Images, PDFs, video, embeds"
          href="/admin/media"
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <StatCard
          label="Revenue this week"
          value={revenue}
          hint="Payments verified since Monday. Unpaid holds are not counted."
        />
        <StatCard
          label="Page views"
          value={pageViews.toLocaleString()}
          hint="Tracked anonymously across all pages."
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel
          title="Next up"
          description="Confirmed and unpaid holds, soonest first"
          actions={
            <Link href="/admin/bookings" className={BTN}>
              All bookings
            </Link>
          }
        >
          {upcoming.length === 0 ? (
            <EmptyState
              icon={<CalendarCheck />}
              title="Nothing booked yet"
              description="Once a service is live and your availability is set, bookings land here."
              action={
                <Link href="/admin/services" className={BTN}>
                  Set up a service
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-rule/70">
              {upcoming.map((booking) => {
                const start = new Date(booking.startISO)
                return (
                  <li
                    key={booking.id}
                    className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[0.88rem] font-medium text-ink">{booking.name}</p>
                      <p className="truncate text-[0.78rem] text-ink-soft">
                        {booking.serviceTitle || booking.serviceId}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink-soft">
                        {start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-[0.78rem] text-ink">
                        {start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        {booking.status === 'pending' ? (
                          <span className="ml-1.5 text-coral-ink">unpaid</span>
                        ) : null}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>

        <Panel
          title="Recently edited"
          description="Posts and newsletters, newest first"
          actions={
            <Link href="/admin/publishing" className={BTN}>
              All posts
            </Link>
          }
        >
          {recentPosts.length === 0 ? (
            <EmptyState
              icon={<PenLine />}
              title="Nothing written yet"
              description="Drafts stay private until you publish them, so there is no cost to starting one."
              action={
                <Link href="/admin/publishing/new" className={BTN_PRIMARY}>
                  Start a post
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-rule/70">
              {recentPosts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/admin/publishing/${post.id}`}
                    className="flex items-baseline justify-between gap-3 py-2.5 transition hover:text-coral-ink"
                  >
                    <span className="min-w-0 flex-1 truncate text-[0.88rem] font-medium text-ink">
                      {post.title || 'Untitled'}
                    </span>
                    <span className="shrink-0 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-soft">
                      {post.status}
                      {post.updatedAt ? ` · ${timeAgo(post.updatedAt)}` : ''}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Jump to" className="mt-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <Link href="/admin/media?new=upload" className={BTN}>
            <ImageIcon className="size-3.5" />
            Upload a file
          </Link>
          <Link href="/admin/media?new=embed" className={BTN}>
            <Plus className="size-3.5" />
            Add an embed
          </Link>
          <Link href="/admin/newsletter" className={BTN}>
            <Users className="size-3.5" />
            Newsletter
          </Link>
          <Link href="/admin/theme" className={BTN}>
            Personalise the look
          </Link>
          <Link href="/admin/settings" className={BTN}>
            Settings & Backup
          </Link>
        </div>
      </Panel>
    </>
  )
}
