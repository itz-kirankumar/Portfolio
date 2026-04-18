'use client'
// components/blocks/ExperienceBlock.tsx
import type { ExperienceContent, PortfolioTheme } from '@/types'
import { Briefcase } from 'lucide-react'

interface Props {
  content: ExperienceContent
  theme?: PortfolioTheme
}

export default function ExperienceBlock({ content, theme }: Props) {
  const primary = theme?.primaryColor || '#7ef0c8'
  const surface = theme?.surfaceColor || '#13131a'

  return (
    <div className="w-full space-y-8">
      {content.title && (
        <h3 className="font-syne text-2xl font-bold mb-8 flex items-center gap-3">
          <Briefcase size={24} style={{ color: primary }} />
          {content.title}
        </h3>
      )}

      <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
        
        {content.items?.map((item, idx) => (
          <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            
            {/* Timeline Node */}
            <div 
              className="flex items-center justify-center w-10 h-10 rounded-full border-4 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"
              style={{ backgroundColor: surface, borderColor: primary, boxShadow: `0 0 15px ${primary}40` }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primary }} />
            </div>
            
            {/* Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 shadow-lg"
                 style={{ backgroundColor: surface, borderColor: 'rgba(255,255,255,0.05)' }}>
              
              <div className="flex flex-col mb-3">
                <span className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: primary }}>{item.duration}</span>
                <h4 className="text-xl font-bold font-syne">{item.role}</h4>
                <p className="text-sm font-medium opacity-60">{item.company}</p>
              </div>
              <p className="text-sm opacity-70 leading-relaxed">{item.description}</p>
            </div>

          </div>
        ))}

      </div>
    </div>
  )
}