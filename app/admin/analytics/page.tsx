import { PageHeader, Panel } from '@/components/admin/ui'
import { safeList } from '@/lib/store'
import { ANALYTICS_COLLECTION, analyticsSchema } from '@/lib/schemas/analytics'
import { BarChart, Activity, Globe, Eye } from 'lucide-react'

export const revalidate = 60

export default async function AnalyticsPage() {
  const events = await safeList(ANALYTICS_COLLECTION, analyticsSchema, {
    orderBy: ['timestamp', 'desc'],
    limit: 1000 // Get up to 1000 recent events
  })

  const totalViews = events.length
  
  // Group by path
  const paths = new Map<string, number>()
  events.forEach(e => {
    paths.set(e.path, (paths.get(e.path) || 0) + 1)
  })
  
  const topPaths = Array.from(paths.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  // Group by referrer
  const referrers = new Map<string, number>()
  events.forEach(e => {
    if (e.referrer) {
      let hostname = e.referrer
      try { hostname = new URL(e.referrer).hostname } catch(err){}
      referrers.set(hostname, (referrers.get(hostname) || 0) + 1)
    }
  })
  
  const topReferrers = Array.from(referrers.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  // Calculate views in last 7 days vs previous 7 days (simple approximation)
  const now = Date.now()
  const week = 7 * 24 * 60 * 60 * 1000
  const recentWeek = events.filter(e => e.timestamp > now - week).length
  const previousWeek = events.filter(e => e.timestamp > now - 2*week && e.timestamp <= now - week).length

  return (
    <>
      <PageHeader
        title="Analytics & Tracking"
        description="A high-level view of your platform's traffic and engagement."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="bg-card border border-rule rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-ink-soft">Recent Views</h3>
            <Eye className="size-4 text-ink-soft" />
          </div>
          <p className="text-3xl font-display font-bold text-ink">{totalViews}</p>
          <p className="text-xs text-ink-soft mt-2">from the last {totalViews === 1000 ? '1000+ ' : ''}events tracked.</p>
        </div>
        
        <div className="bg-card border border-rule rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-ink-soft">Last 7 Days</h3>
            <Activity className="size-4 text-ink-soft" />
          </div>
          <p className="text-3xl font-display font-bold text-ink">{recentWeek}</p>
          <p className="text-xs text-ink-soft mt-2">
            {recentWeek > previousWeek ? '+' : ''}{previousWeek > 0 ? Math.round(((recentWeek - previousWeek) / previousWeek) * 100) : 100}% vs previous week
          </p>
        </div>
        
        <div className="bg-card border border-rule rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-ink-soft">Unique Referrers</h3>
            <Globe className="size-4 text-ink-soft" />
          </div>
          <p className="text-3xl font-display font-bold text-ink">{referrers.size}</p>
          <p className="text-xs text-ink-soft mt-2">sources driving traffic to your site.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Top Content" description="Most viewed pages across the site.">
          <ul className="divide-y divide-rule/50">
            {topPaths.length > 0 ? topPaths.map(([path, count]) => (
              <li key={path} className="flex justify-between items-center py-3">
                <span className="font-mono text-sm text-ink truncate pr-4">{path}</span>
                <span className="font-medium text-ink bg-rule/50 px-2 py-0.5 rounded text-sm">{count}</span>
              </li>
            )) : <p className="text-ink-soft text-sm py-4">No data yet.</p>}
          </ul>
        </Panel>
        
        <Panel title="Top Sources" description="Where your visitors are coming from.">
          <ul className="divide-y divide-rule/50">
            {topReferrers.length > 0 ? topReferrers.map(([ref, count]) => (
              <li key={ref} className="flex justify-between items-center py-3">
                <span className="text-sm text-ink truncate pr-4">{ref}</span>
                <span className="font-medium text-ink bg-rule/50 px-2 py-0.5 rounded text-sm">{count}</span>
              </li>
            )) : <p className="text-ink-soft text-sm py-4">No external referrers detected yet.</p>}
          </ul>
        </Panel>
      </div>
    </>
  )
}