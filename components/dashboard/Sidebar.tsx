'use client'
// components/dashboard/Sidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Blocks, Palette, Briefcase,
  CreditCard, Settings, LogOut, ExternalLink, User
} from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'

const NAV = [
  { href: '/dashboard',          label: 'Overview',   icon: LayoutDashboard },
  { href: '/dashboard/blocks',   label: 'Blocks',     icon: Blocks },
  { href: '/dashboard/theme',    label: 'Theme',      icon: Palette },
  { href: '/dashboard/services', label: 'Services',   icon: Briefcase },
  { href: '/dashboard/payments', label: 'Payments',   icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings',   icon: Settings },
]

interface SidebarProps {
  user: { 
    name?: string | null; 
    email?: string | null; 
    image?: string | null; 
    id: string 
  }
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const { profile } = useProfile()

  // Use username if available, otherwise fallback to user id
  const username = profile?.username || user.id

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0d0d14] border-r border-white/[0.06] flex flex-col z-50">

      {/* Logo */}
      <div className="p-6 border-b border-white/[0.06]">
        <span className="font-syne text-xl font-black text-white">
          port<span className="text-[#7ef0c8]">folio</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                active
                  ? 'bg-[#7ef0c8]/10 text-[#7ef0c8] font-medium'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-white/[0.06] space-y-2">
        
        {/* FIXED: View Portfolio Button */}
        <a
          href={`/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all"
        >
          <ExternalLink size={16} />
          View Portfolio
        </a>

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03]">
          {user.image ? (
            <img src={user.image} alt="" className="w-7 h-7 rounded-full" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#7ef0c8]/20 flex items-center justify-center">
              <User size={14} className="text-[#7ef0c8]" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user.name}</p>
            <p className="text-white/30 text-[10px] truncate">{user.email}</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-red-400 hover:bg-red-500/[0.05] transition-all"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}