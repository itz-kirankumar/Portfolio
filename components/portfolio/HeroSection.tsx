'use client'
// components/portfolio/HeroSection.tsx
import React from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import type { UserProfile } from '@/types'

export default function HeroSection({ profile }: { profile: UserProfile }) {
  const theme = profile.theme;
  const primary = theme?.primaryColor || '#7ef0c8';
  const bgColor = theme?.bgColor || '#030305';
  const textColor = theme?.textColor || '#ffffff';

  const title = profile.displayName || 'Your Name';
  const tagline = profile.heroTagline || "Digital Craftsman";
  const bio = profile.bio || "Building exceptional digital experiences with unparalleled precision.";
  
  const btn1Label = profile.heroPrimaryLabel || 'View My Work';
  const btn1Url = profile.heroPrimaryUrl || '#work';
  const btn2Label = profile.heroSecondaryLabel || 'Get in Touch';
  const btn2Url = profile.heroSecondaryUrl || '#contact';

  return (
    // FIX: Removed duplicate <GlobalBackdrop /> from here. 
    // It is already rendered at the absolute root of page.tsx
    <section className="relative min-h-[92vh] flex items-center pt-24 pb-12 overflow-hidden" style={{ color: textColor }}>
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center relative z-10 w-full">
        {/* Left Content Area */}
        <div className="space-y-8 relative">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-panel border border-white/10 text-xs font-semibold tracking-wide uppercase shadow-lg backdrop-blur-md cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: primary }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: primary }}></span>
            </span>
            Available for new opportunities
          </div>

          <div className="space-y-2">
            <h1 className="text-6xl sm:text-7xl lg:text-[5.5rem] font-black font-syne tracking-tight leading-[1.05]">
              {title}
            </h1>
            <h2 className="text-2xl sm:text-3xl font-syne font-bold opacity-50 tracking-tight flex items-center gap-3">
              <Sparkles className="opacity-50" size={24} style={{ color: primary }} />
              {tagline}
            </h2>
          </div>

          <p className="text-lg sm:text-xl opacity-70 max-w-lg leading-relaxed font-light">
            {bio}
          </p>

          <div className="flex flex-wrap items-center gap-5 pt-6">
            <a 
              href={btn1Url} 
              className="px-8 py-4 rounded-full font-bold flex items-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 group shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-xl"
              style={{ backgroundColor: primary, color: bgColor }}
            >
              {btn1Label}
              <ArrowRight className="group-hover:translate-x-1.5 transition-transform duration-300" size={18} />
            </a>

            <a 
              href={btn2Url} 
              className="px-8 py-4 rounded-full border opacity-80 hover:opacity-100 hover:bg-white/10 transition-all font-bold"
              style={{ borderColor: primary }}
            >
              {btn2Label}
            </a>
          </div>
        </div>

        {/* Right - Profile Display Image */}
        <div className="relative flex justify-center lg:justify-end w-full group perspective-1000">
          <div className="relative w-full max-w-[400px] aspect-[4/5] mx-auto z-10 animate-float" style={{ transformStyle: 'preserve-3d' }}>
            
            <div className="absolute -inset-5 border-2 rounded-[2.5rem] transition-transform duration-700 translate-z-[-20px] group-hover:translate-x-3 group-hover:translate-y-3" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <div className="absolute -inset-2 rounded-[2rem] opacity-[0.03] transition-all duration-700 translate-z-[-10px] group-hover:-translate-x-4 group-hover:-translate-y-4" style={{ backgroundColor: primary }} />

            <div 
              className="relative w-full h-full rounded-[2rem] overflow-hidden border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-transform duration-700 group-hover:rotate-y-[4deg] group-hover:rotate-x-[-2deg] group-hover:scale-[1.02]"
              style={{ backgroundColor: theme?.surfaceColor || '#0d0d14' }}
            >
              <div className="absolute inset-0 z-10 shadow-[inset_0_0_40px_rgba(0,0,0,0.6)] pointer-events-none" />

              {profile.avatar ? (
                <img src={profile.avatar} alt={title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10rem] font-black" style={{ background: `linear-gradient(135deg, ${primary}10, ${bgColor})`, color: primary }}>
                  {title.charAt(0) || 'K'}
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 h-32 z-20 pointer-events-none" style={{ background: `linear-gradient(to top, ${bgColor}, transparent)` }} />
            </div>
            
          </div>
        </div>
      </div>
    </section>
  )
}