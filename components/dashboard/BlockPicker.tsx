'use client'
// components/dashboard/BlockPicker.tsx
import { X } from 'lucide-react'
import type { BlockType } from '@/types'

const BLOCK_TYPES: { type: BlockType; icon: string; label: string; desc: string }[] = [
  { type: 'text',        icon: '📝', label: 'Rich Text',    desc: 'Formatted text with headings, lists, links' },
  { type: 'image',       icon: '🖼️', label: 'Image',        desc: 'Upload or link an image with caption' },
  { type: 'youtube',     icon: '▶️', label: 'YouTube',      desc: 'Embed any YouTube video' },
  { type: 'instagram',   icon: '📸', label: 'Instagram',    desc: 'Embed an Instagram post or reel' },
  { type: 'linkedin',    icon: '💼', label: 'LinkedIn',     desc: 'Embed a LinkedIn post or article' },
  { type: 'map',         icon: '📍', label: 'Map',          desc: 'Show a Google Maps location' },
  { type: 'pdf',         icon: '📄', label: 'PDF / Doc',    desc: 'Upload and display a PDF or document' },
  { type: 'testimonial', icon: '💬', label: 'Testimonial',  desc: 'Client quote with name and role' },
  { type: 'service',     icon: '💎', label: 'Service',      desc: '1:1 mentorship or any paid service' },
  { type: 'button',      icon: '🔘', label: 'Button',       desc: 'Custom CTA button with any link' },
  { type: 'blog',        icon: '📰', label: 'Blog Post',    desc: 'Full article with cover image' },
  { type: 'skills',      icon: '📊', label: 'Skills',       desc: 'Skills grid with progress levels' },
  { type: 'project',     icon: '🚀', label: 'Project',      desc: 'Showcase a project with links' },
  { type: 'social',      icon: '🔗', label: 'Social Links', desc: 'All your social media links' },
  { type: 'divider',     icon: '➖', label: 'Divider',      desc: 'Line, space, or decorative divider' },
  { type: 'contact',     icon: '✉️', label: 'Contact Form', desc: 'Beautiful Get In Touch form' },
  { type: 'testimonial', icon: '💬', label: 'Testimonial',  desc: 'Client quote with name and role' },
  { type: 'experience',  icon: '⏳', label: 'Experience',   desc: 'Professional work timeline' }, // NEW
]

interface Props {
  onSelect: (type: BlockType) => void
  onClose: () => void
}

export default function BlockPicker({ onSelect, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0d0d14] border border-white/[0.08] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="font-syne text-lg font-bold text-white">Add a block</h2>
            <p className="text-white/40 text-xs mt-0.5">Choose the type of content to add</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 grid grid-cols-3 gap-3">
          {BLOCK_TYPES.map(({ type, icon, label, desc }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="text-left p-4 bg-[#13131a] border border-white/[0.06] rounded-xl hover:border-[#7ef0c8]/30 hover:bg-[#7ef0c8]/[0.04] transition-all group"
            >
              <span className="text-2xl mb-2 block">{icon}</span>
              <p className="text-white text-sm font-medium mb-1 group-hover:text-[#7ef0c8] transition-colors">{label}</p>
              <p className="text-white/30 text-xs leading-relaxed">{desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}