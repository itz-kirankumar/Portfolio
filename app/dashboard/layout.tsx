// app/dashboard/layout.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Sidebar user={{
        id: session.user.id || '',
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }} />

      {/* 
        FIXED: 
        1. <main> only handles clearing the fixed sidebar (md:pl-64) and mobile header (pt-20)
        2. The inner <div> safely handles the left/right padding (px-5 md:px-8) 
      */}
      <main className="w-full md:pl-64 pt-20 md:pt-8 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-5 md:px-8 pb-12">
          {children}
        </div>
      </main>
    </div>
  )
}