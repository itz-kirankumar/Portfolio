'use client'
// components/blocks/ProjectBlock.tsx
import type { ProjectContent } from '@/types'
import { ExternalLink, Code2 } from 'lucide-react'

export default function ProjectBlock({ content }: { content: ProjectContent }) {
  const { title, description, thumbnail, liveUrl, githubUrl } = content
  
  // Robust tag handling to prevent ".map is not a function" error
  const tags = Array.isArray(content.tags) 
    ? content.tags 
    : typeof content.tags === 'string' 
      ? (content.tags as string).split(',').map(t => t.trim()).filter(Boolean)
      : [];

  if (!title) return null

  return (
    <div className="bg-[#13131a] border border-white/10 rounded-2xl overflow-hidden group hover:border-white/20 transition-all duration-300">
      {thumbnail && (
        <div className="h-48 overflow-hidden">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-6 space-y-3">
        <h3 className="font-syne font-bold text-white text-lg">{title}</h3>
        {description && (
          <p className="text-white/50 text-sm leading-relaxed">{description}</p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t: string) => (
              <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/40">
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-3 pt-1">
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-[#7ef0c8] hover:text-[#5dd4aa] transition-colors"
            >
              <ExternalLink size={14} />
              Live
            </a>
          )}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              <Code2 size={14} />
              GitHub
            </a>
          )}
        </div>
      </div>
    </div>
  )
}