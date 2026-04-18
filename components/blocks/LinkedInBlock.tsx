'use client'
// components/blocks/LinkedInBlock.tsx
import type { LinkedInContent, PortfolioTheme } from '@/types'
import { ExternalLink } from 'lucide-react'
import { LinkedInEmbed } from 'react-social-media-embed'

interface Props {
  content: LinkedInContent
  theme?: PortfolioTheme // FIX: Accept the theme prop to clear TS error
}

const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.854 0-2.137 1.446-2.137 2.94v5.666H9.35V9h3.414v1.561h.048c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063-2.065 2.063 2.063 0 01-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.205 24 24 23.227 24 22.271V1.729C24 .774 23.205 0 22.225 0z"/>
  </svg>
)

export default function LinkedInBlock({ content, theme }: Props) {
  if (!content.url) return null

  // Dynamic Theme Colors
  const primary = theme?.primaryColor || '#0077b5'
  const surface = theme?.surfaceColor || '#13131a'

  return (
    <div 
      className="group relative border rounded-[2rem] p-6 md:p-8 overflow-hidden text-left transition-all duration-500 hover:-translate-y-1 shadow-lg"
      style={{ 
        backgroundColor: surface, 
        borderColor: `${primary}20`,
        boxShadow: `0 10px 40px -10px ${primary}15` 
      }}
    >
      {/* Ambient Glow */}
      <div 
        className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"
        style={{ backgroundColor: primary }}
      />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
          style={{ backgroundColor: primary, boxShadow: `0 4px 20px ${primary}40` }}
        >
          <LinkedInIcon />
        </div>
        <div>
          <h4 className="text-white font-bold font-syne text-lg">LinkedIn Insight</h4>
          <p className="text-white/40 text-xs uppercase tracking-widest font-bold mt-0.5">Featured Publication</p>
        </div>
      </div>

      {/* Actual LinkedIn Post Preview */}
      <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#0a0a0f] relative z-10">
        <LinkedInEmbed
          url={content.url}
          postUrl={content.url}
          width="100%"
          height={570}
        />
      </div>

      {/* Action Link */}
      <a
        href={content.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider hover:opacity-80 transition-opacity relative z-10"
        style={{ color: primary }}
      >
        Open on LinkedIn
        <ExternalLink size={16} />
      </a>
    </div>
  )
}