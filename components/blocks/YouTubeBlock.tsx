'use client'
// components/blocks/YouTubeBlock.tsx
import type { YouTubeContent } from '@/types'

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/)
  return match ? match[1] : null
}

export default function YouTubeBlock({ content }: { content: YouTubeContent }) {
  const id = getYouTubeId(content.url)
  if (!id) return null
  return (
    <div className="space-y-3">
      {content.title && <h3 className="font-syne font-bold text-white text-xl">{content.title}</h3>}
      <div className="relative pb-[56.25%] h-0 rounded-2xl overflow-hidden bg-[#13131a]">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${id}${content.autoplay ? '?autoplay=1' : ''}`}
          title={content.title || 'YouTube video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}