'use client'
// components/dashboard/Sidebar.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Blocks, Palette, Briefcase,
  CreditCard, Settings, LogOut, ExternalLink, User, Menu, X
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
  const [isOpen, setIsOpen] = useState(false)

  // Use username if available, otherwise fallback to user id
  const username = profile?.username || user.id

  // Auto-close sidebar when route changes on mobile
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 right-4 z-40 p-3 bg-[#13131a] border border-white/10 rounded-xl text-white shadow-lg hover:bg-white/5 transition-colors"
      >
        <Menu size={22} />
      </button>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed left-0 top-0 h-[100dvh] w-64 bg-[#0d0d14] border-r border-white/[0.06] flex flex-col z-50 transition-transform duration-300 ease-in-out will-change-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Logo & Mobile Close */}
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between shrink-0">
          <span className="font-syne text-xl font-black text-white">
            port<span className="text-[#7ef0c8]">folio</span>
          </span>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 -mr-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 [&::-webkit-scrollbar]:hidden">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-xl text-sm transition-all duration-150 ${
                  active
                    ? 'bg-[#7ef0c8]/10 text-[#7ef0c8] font-medium'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                }`}
              >
                {/* Slightly larger icons on mobile for touch targets */}
                <Icon className="w-5 h-5 md:w-4 md:h-4" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User Section (Bottom) */}
        <div className="p-4 border-t border-white/[0.06] space-y-2 shrink-0 bg-[#0d0d14]">
          <a
            href={`/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all"
          >
            <ExternalLink className="w-5 h-5 md:w-4 md:h-4" />
            View Portfolio
          </a>

          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-xl bg-white/[0.03]">
            {user.image ? (
              <img src={user.image} alt="" className="w-8 h-8 md:w-7 md:h-7 rounded-full object-cover" />
            ) : (
               <div className="w-8 h-8 md:w-7 md:h-7 rounded-full bg-[#7ef0c8]/20 flex items-center justify-center shrink-0">
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
            className="w-full flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-xl text-sm text-white/30 hover:text-red-400 hover:bg-red-500/[0.05] transition-all"
          >
            <LogOut className="w-5 h-5 md:w-4 md:h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}