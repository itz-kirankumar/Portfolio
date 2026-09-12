'use client'

import { useState, useEffect } from 'react'
import { Send, Share2, MessageSquare, ThumbsUp } from 'lucide-react'

export function ArticleActions({ title, slug }: { title: string; slug: string }) {
  const [url, setUrl] = useState('')
  const [likes, setLikes] = useState(0)
  
  useEffect(() => {
    setUrl(window.location.href)
  }, [])

  return (
    <div className="mt-12 text-center">
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <button 
          onClick={() => setLikes(likes + 1)}
          className="flex items-center gap-2 rounded-full border border-rule bg-paper px-4 py-2 text-sm font-medium text-ink transition hover:border-coral hover:text-coral"
        >
          <ThumbsUp className="size-4" />
          <span>{likes > 0 ? likes : 'Like'}</span>
        </button>
        <button 
          onClick={() => {
            document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="flex items-center gap-2 rounded-full border border-rule bg-paper px-4 py-2 text-sm font-medium text-ink transition hover:border-coral hover:text-coral"
        >
          <MessageSquare className="size-4" />
          <span>Reply</span>
        </button>
        <div className="h-6 w-px bg-rule hidden sm:block mx-2" />
        <a 
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`} 
          target="_blank" 
          rel="noreferrer" 
          className="flex items-center gap-2 rounded-full bg-paper-deep px-4 py-2 text-sm font-medium text-ink transition hover:bg-rule"
        >
          <Send className="size-4" />
          <span className="hidden sm:inline">Share on X</span>
        </a>
        <a 
          href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`} 
          target="_blank" 
          rel="noreferrer" 
          className="flex items-center gap-2 rounded-full bg-paper-deep px-4 py-2 text-sm font-medium text-ink transition hover:bg-rule"
        >
          <Share2 className="size-4" />
          <span className="hidden sm:inline">LinkedIn</span>
        </a>
      </div>
    </div>
  )
}
