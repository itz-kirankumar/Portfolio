'use client'
// components/blocks/BlogBlock.tsx
import type { BlogContent } from '@/types'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function BlogBlock({ 
  content, 
  username 
}: { 
  content: BlogContent 
  username?: string 
}) {
  if (!content.title) return null

  const readTime = content.html 
    ? Math.ceil(content.html.split(' ').length / 225) 
    : 5

  // Generate slug from title if not provided
  const slug = content.slug || 
    content.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

  const blogUrl = username && slug 
    ? `/${username}/blog/${slug}` 
    : '#'

  return (
    <article className="group bg-[#13131a] border border-white/[0.08] rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-500">
      {content.coverImage && (
        <div className="relative h-80 overflow-hidden">
          <img 
            src={content.coverImage} 
            alt={content.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        </div>
      )}

      <div className="p-9 md:p-12">
        <div className="flex items-center gap-5 text-xs uppercase tracking-widest text-white/40 mb-6">
          <div className="flex items-center gap-1.5">
            <Calendar size={15} />
            {content.publishedAt 
              ? new Date(content.publishedAt).toLocaleDateString('en-IN', { 
                  month: 'long', day: 'numeric', year: 'numeric' 
                })
              : 'Recently'}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={15} />
            {readTime} min read
          </div>
        </div>

        <h2 className="font-syne text-4xl md:text-5xl font-bold leading-tight text-white mb-5 tracking-[-0.02em]">
          {content.title}
        </h2>

        {content.excerpt && (
          <p className="text-white/75 text-[17.5px] leading-relaxed line-clamp-3 mb-8">
            {content.excerpt}
          </p>
        )}

        <Link 
          href={blogUrl}
          className="inline-flex items-center gap-3 text-[#7ef0c8] hover:text-white font-medium text-base group/link transition-colors"
        >
          Read Full Article
          <ArrowRight 
            size={20} 
            className="group-hover/link:translate-x-1 transition-transform duration-300" 
          />
        </Link>
      </div>
    </article>
  )
}