'use client'
// components/blocks/PDFBlock.tsx
import type { PDFContent } from '@/types'
import { FileText, Download } from 'lucide-react'

export default function PDFBlock({ content }: { content: PDFContent }) {
  if (!content.url) return null
  return (
    <div className="bg-[#13131a] border border-white/[0.07] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-[#7ef0c8]" />
          <span className="text-white/70 text-sm">{content.filename || 'Document'}</span>
        </div>
        <a
          href={content.url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          <Download size={13} />
          Download
        </a>
      </div>
      <iframe
        src={`${content.url}#view=FitH`}
        title={content.filename}
        className="w-full h-[600px]"
        style={{ border: 0 }}
      />
    </div>
  )
}