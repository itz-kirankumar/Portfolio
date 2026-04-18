'use client'
// app/dashboard/page.tsx
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Blocks, Eye, CreditCard, ExternalLink, ArrowRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { useProfile } from '@/hooks/useProfile'

export default function DashboardPage() {
  const { data: session } = useSession()
  const { profile } = useProfile()
  const [blockCount, setBlockCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/blocks')
      .then(r => r.json())
      .then(d => setBlockCount(d.blocks?.length ?? 0))
      .catch(() => setBlockCount(0))
  }, [])

  const firstName = session?.user.name?.split(' ')[0] ?? 'there'
  const username = profile?.username || session?.user.id

  return (
    <div className="max-w-5xl">
      <div className="flex items-end gap-6 mb-10">
        {profile?.avatar ? (
          <img src={profile.avatar} alt="" className="w-20 h-20 rounded-2xl object-cover ring-2 ring-[#7ef0c8]/30" />
        ) : (
          <div className="w-20 h-20 bg-gradient-to-br from-[#7ef0c8] to-[#818cf8] rounded-2xl flex items-center justify-center text-4xl font-bold text-white">
            {firstName[0]}
          </div>
        )}
        <div>
          <h1 className="font-syne text-4xl font-bold text-white">Welcome back, {firstName} 👋</h1>
          <p className="text-white/40">Your portfolio is looking 🔥</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Link href="/dashboard/blocks" className="group">
          <div className="bg-[#13131a] border border-white/10 rounded-3xl p-6 hover:border-[#7ef0c8]/40 transition-all">
            <Blocks size={22} className="text-[#7ef0c8] mb-4" />
            <p className="text-5xl font-syne font-bold text-white mb-1">{blockCount ?? '—'}</p>
            <p className="text-white/40 text-sm">Content Blocks</p>
          </div>
        </Link>

        <div className="bg-[#13131a] border border-white/10 rounded-3xl p-6">
          <Eye size={22} className="text-[#7ef0c8] mb-4" />
          <p className="text-5xl font-syne font-bold text-white mb-1">2.4k</p>
          <p className="text-white/40 text-sm">Portfolio Views • This month</p>
        </div>

        <Link href="/dashboard/services" className="group">
          <div className="bg-[#13131a] border border-white/10 rounded-3xl p-6 hover:border-[#7ef0c8]/40 transition-all">
            <CreditCard size={22} className="text-[#7ef0c8] mb-4" />
            <p className="text-5xl font-syne font-bold text-white mb-1">₹0</p>
            <p className="text-white/40 text-sm">Earnings from services</p>
          </div>
        </Link>
      </div>

      {/* View Live Portfolio - FIXED */}
      {username && (
        <Link
          href={`/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-3 text-[#7ef0c8] hover:text-white text-lg font-medium"
        >
          <ExternalLink size={20} />
          See your live portfolio →
        </Link>
      )}
    </div>
  )
}