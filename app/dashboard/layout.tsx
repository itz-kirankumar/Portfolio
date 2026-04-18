'use client'
// app/dashboard/layout.tsx
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import GlobalBackdrop from '@/components/portfolio/GlobalBackdrop'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#7ef0c8] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/30 text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      <GlobalBackdrop />
      <Sidebar user={session.user} />
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}