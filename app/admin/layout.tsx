// app/admin/layout.tsx
//
// The gate here is a UX affordance, not the security boundary. Server Actions
// POST to the page route and Route Handlers have no layout at all, so every
// action and handler authenticates itself — see lib/guard.ts.
//
// Reading cookies() would normally cost a route its prerender. It costs nothing
// here: resolving the session already made /admin dynamic, and in exchange the
// sidebar renders at the right width on the first paint instead of snapping
// shut after hydration.

import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import Sidebar, { SIDEBAR_COOKIE } from '@/components/admin/shell/Sidebar'
import Topbar from '@/components/admin/shell/Topbar'
import { Toaster } from '@/components/admin/ui'
import { authOptions } from '@/lib/auth'

export const metadata: Metadata = {
  title: { default: 'Command centre', template: '%s · Command centre' },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) redirect('/login')

  const store = await cookies()
  const collapsed = store.get(SIDEBAR_COOKIE)?.value === '1'

  return (
    <div className="flex min-h-screen bg-paper font-sans text-ink">
      <Sidebar initialCollapsed={collapsed} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar email={session.user.email ?? ''} name={session.user.name ?? ''} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>

      <Toaster />
    </div>
  )
}
