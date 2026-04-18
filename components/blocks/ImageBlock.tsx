'use client'
// components/blocks/ImageBlock.tsx
import type { ImageContent, PortfolioTheme } from '@/types'

interface Props {
  content: ImageContent
  theme?: PortfolioTheme // FIX: Accept the theme prop to clear TS error
}

export default function ImageBlock({ content, theme }: Props) {
  if (!content.url) return null

  // Dynamic Theme Colors
  const primary = theme?.primaryColor || '#7ef0c8'
  const surface = theme?.surfaceColor || '#13131a'

  const img = (
    <img
      src={content.url}
      alt={content.alt || content.caption || ''}
      className="w-full rounded-2xl object-cover transition-transform duration-700 group-hover:scale-105"
    />
  )

  return (
    <figure 
      className="group relative p-2 md:p-3 rounded-[2.5rem] border overflow-hidden transition-all duration-500 hover:-translate-y-1 shadow-lg"
      style={{ 
        backgroundColor: surface, 
        borderColor: `${primary}20`,
        boxShadow: `0 10px 40px -10px ${primary}15`
      }}
    >
      <div className="overflow-hidden rounded-3xl relative">
        {/* Sleek Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
        
        {content.link ? (
          <a href={content.link} target="_blank" rel="noopener noreferrer" className="block relative z-20">
            {img}
          </a>
        ) : img}
      </div>
      
      {/* Animated Caption */}
      {content.caption && (
        <figcaption className="absolute bottom-6 left-0 right-0 text-center text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 translate-y-2 group-hover:translate-y-0 px-4 drop-shadow-md">
          {content.caption}
        </figcaption>
      )}
    </figure>
  )
}