import { getAdminDb } from '@/lib/admin'
import { requireOwner } from '@/lib/guard'
import { PageHeader, Panel, StatCard } from '@/components/admin/ui'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Analytics' }

type Event = { name: string; path: string; sessionId: string; timestamp: number; props?: { target?: string; referrer?: string; percent?: number; seconds?: number } }
export default async function AnalyticsPage() {
  await requireOwner()
  let events: Event[] = []
  let failed = false
  try {
    const snapshot = await getAdminDb().collection('portfolioEvents').where('timestamp', '>=', Date.now() - 30 * 86400000).orderBy('timestamp', 'desc').limit(10000).get()
    events = snapshot.docs.map(d => d.data() as Event)
  } catch { failed = true }
  const views = events.filter(e => e.name === 'page_view')
  const sessions = new Set(views.map(e => e.sessionId)).size
  const count = (name: string) => events.filter(e => e.name === name).length
  const groups = (rows: Event[], key: (e: Event) => string) => {
    const m = new Map<string, number>()
    for (const e of rows) { const k = key(e); m.set(k, (m.get(k) || 0) + 1) }
    return [...m].sort((a,b) => b[1] - a[1]).slice(0, 12)
  }
  const table = (rows: [string, number][]) => rows.length ? <div className="divide-y divide-rule">{rows.map(([label, n]) => <div key={label} className="flex justify-between gap-4 py-2 text-sm"><span className="min-w-0 break-all">{label}</span><span>{n.toLocaleString()}</span></div>)}</div> : <p className="py-4 text-sm text-ink-soft">No events yet. Counts begin after deployment and visitor consent.</p>
  const sessionsWith = (name: string) => new Set(events.filter(e => e.name === name).map(e => e.sessionId)).size
  return <>
    <PageHeader title="Analytics" description="Last 30 days. Consent-based anonymous sessions, not identified people. Owner, admin, preview, receipt, automation and opted-out traffic excluded." />
    {failed && <p className="mb-4 rounded border border-red-300 p-4 text-red-600">Analytics could not be loaded. These figures are unavailable, not zero.</p>}
    {events.length === 10000 && <p className="mb-4">Showing the latest 10,000 events only.</p>}
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Page views" value={failed ? 'Unavailable' : views.length} />
      <StatCard label="Browser sessions" value={failed ? 'Unavailable' : sessions} hint="A tab session, not a unique person" />
      <StatCard label="Resume downloads" value={failed ? 'Unavailable' : count('resume_download')} hint="Download clicks, not proof the PDF was read" />
      <StatCard label="Newsletter signups" value={failed ? 'Unavailable' : count('newsletter_subscribed')} hint="Successful responses only" />
    </div>
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <Panel title="Top pages">{table(groups(views, e => e.path))}</Panel>
      <Panel title="Referrers">{table(groups(views, e => e.props?.referrer || 'Direct / unavailable'))}</Panel>
      <Panel title="Interactions">{table(groups(events.filter(e => e.name !== 'page_view'), e => e.name))}</Panel>
      <Panel title="Project, source and resume clicks">{table(groups(events.filter(e => ['project_click','source_click','resume_download'].includes(e.name)), e => e.props?.target || e.path))}</Panel>
      <Panel title="Reading depth">{table(groups(events.filter(e => e.name === 'reading_depth'), e => `${e.props?.percent}% of page`))}</Panel>
      <Panel title="Engaged reading">{table(groups(events.filter(e => e.name === 'engaged_time'), e => `${e.props?.seconds} seconds visible`))}</Panel>
      <Panel title="Booking journey" description="Distinct browser sessions at each step. Submitting the form is not payment or a confirmed booking.">{table([['Viewed booking page', sessionsWith('booking_view')], ['Submitted booking form', sessionsWith('booking_submit')]])}</Panel>
      <Panel title="Provider dashboards" description="Providers count differently. Do not add their totals together.">
        <div className="flex flex-col gap-3 py-2 text-sm">
          <a className="link-underline" href="https://vercel.com/kiran-kumar-g/project-65mna/analytics">Vercel: traffic, sources, devices and regions</a>
          <a className="link-underline" href="https://clarity.microsoft.com/projects/view/zath09upbe/dashboard">Clarity: heatmaps, masked replay, rage and dead clicks</a>

        </div>
      </Panel>
    </div>
    <p className="mt-5 text-xs text-ink-soft">Data starts with this instrumentation; historical visits are not reconstructed. No email addresses, names, form text, receipt tokens, full referrer URLs or query strings are stored. Reading thresholds are cumulative milestones, not separate readers. DNT and visitor opt-out are respected.</p>
  </>
}
