'use client'
// components/blocks/InstagramBlock.tsx
import type { InstagramContent } from '@/types'
import { useEffect } from 'react'

export default function InstagramBlock({ content }: { content: InstagramContent }) {
  useEffect(() => {
    // Load Instagram embed script
    if (document.getElementById('instagram-embed-script')) {
      // @ts-ignore
      if (window.instgrm) window.instgrm.Embeds.process()
      return
    }
    const script = document.createElement('script')
    script.id = 'instagram-embed-script'
    script.src = 'https://www.instagram.com/embed.js'
    script.async = true
    document.body.appendChild(script)
  }, [content.url])

  if (!content.url) return null

  // Normalize URL - strip query params
  const cleanUrl = content.url.split('?')[0]

  return (
    <div className="flex justify-center">
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={cleanUrl}
        data-instgrm-version="14"
        style={{ maxWidth: '540px', width: '100%' }}
      />
    </div>
  )
}