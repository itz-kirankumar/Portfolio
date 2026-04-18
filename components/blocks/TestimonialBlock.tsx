'use client'
// components/blocks/TestimonialBlock.tsx
import type { TestimonialContent, PortfolioTheme } from '@/types'
import { Quote, Star } from 'lucide-react'

interface Props {
  content: TestimonialContent
  theme?: PortfolioTheme
  inMarquee?: boolean
}

export default function TestimonialBlock({ content, theme, inMarquee }: Props) {
  const { quote, name, role, rating = 5 } = content
  const primary = theme?.primaryColor || '#7ef0c8'
  const surface = theme?.surfaceColor || '#13131a'
  
  return (
    <div 
      className={`relative group border rounded-[2rem] p-10 hover:-translate-y-2 transition-all duration-500 shadow-xl ${inMarquee ? 'h-full flex flex-col justify-between cursor-default' : ''}`}
      style={{ 
        backgroundColor: surface,
        borderColor: `${primary}20`,
        boxShadow: `0 10px 40px -10px ${primary}10`
      }}
    >
      <Quote size={40} className="absolute top-8 right-10 transition-colors opacity-10 group-hover:opacity-30" style={{ color: primary }} />
      
      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={16} 
            className={i < rating ? 'fill-current' : 'opacity-20'} 
            style={{ color: i < rating ? primary : 'currentColor' }} 
          />
        ))}
      </div>

      <p className="text-xl md:text-2xl font-medium leading-relaxed mb-10 tracking-tight">
        &ldquo;{quote}&rdquo;
      </p>

      <div className="flex items-center justify-between border-t pt-8 mt-auto" style={{ borderColor: `${primary}15` }}>
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-full border flex items-center justify-center font-bold shadow-inner"
            style={{ backgroundColor: `${primary}10`, borderColor: `${primary}30`, color: primary }}
          >
            {name.charAt(0)}
          </div>
          <div>
            <p className="font-bold">{name}</p>
            <p className="opacity-50 text-xs uppercase tracking-widest font-bold mt-0.5">{role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}