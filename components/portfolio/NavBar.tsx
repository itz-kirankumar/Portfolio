'use client'
// components/portfolio/NavBar.tsx
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { UserProfile, NavLink } from '@/types'

export default function NavBar({ profile }: { profile: UserProfile }) {
  const theme = profile.theme;
  const primaryColor = theme?.primaryColor || '#7ef0c8';

  const brandName = profile.navBrandName || profile.displayName.split(' ')[0];
  
  // Safely fallback and cast the type
  const navLinks: NavLink[] = profile.navLinks?.length ? profile.navLinks : [
    { label: 'Work', href: '#work' },
    { label: 'Essays', href: '#blog' }
  ];

  return (
    <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="glass-panel pointer-events-auto rounded-full px-2 py-2 flex items-center justify-between min-w-[320px] w-full max-w-3xl transition-all duration-300 hover:bg-white/[0.04]">
        
        <Link href={`/${profile.username}`} className="flex items-center gap-2 pl-4 group">
          <div className="w-2 h-2 rounded-full transition-transform group-hover:scale-150" style={{ backgroundColor: primaryColor }} />
          <span className="font-syne font-bold text-lg tracking-tight text-white group-hover:text-white/80 transition-colors">
            {brandName}
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 px-6 border-x border-white/5 mx-4">
          {navLinks.map((link, i) => (
            <a 
              key={i} 
              href={link.href} 
              className="px-4 py-2 rounded-full text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              {link.label}
            </a>
          ))}
        </div>

        <a 
          href={profile.heroPrimaryUrl || profile.hireMeUrl || '#contact'}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden group"
          style={{ backgroundColor: primaryColor, color: '#030305' }}
        >
          <span className="relative z-10">{profile.heroPrimaryLabel || profile.hireMeLabel || 'Hire Me'}</span>
          <ArrowUpRight size={14} className="relative z-10 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite] z-0" />
        </a>
      </nav>
    </div>
  )
}