'use client'
// components/blocks/TextBlock.tsx
import type { TextContent } from '@/types'
export default function TextBlock({ content }: { content: TextContent }) {
  return (
    <div
      className="prose prose-invert prose-headings:font-syne prose-headings:font-bold prose-p:text-white/70 prose-a:text-[#7ef0c8] max-w-none"
      dangerouslySetInnerHTML={{ __html: content.html }}
    />
  )
}