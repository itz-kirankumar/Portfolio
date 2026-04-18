'use client'
// app/dashboard/blocks/page.tsx
import { useState, useEffect } from 'react'
import { Plus, GripVertical, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react'
import BlockPicker from '@/components/dashboard/BlockPicker'
import BlockEditor from '@/components/dashboard/BlockEditor'
import type { Block } from '@/types'
import { usePortfolioStore } from '@/store/portfolioStore'

export default function BlocksPage() {
  const { blocks, setBlocks, updateBlock, removeBlock } = usePortfolioStore()
  const [showPicker, setShowPicker] = useState(false)
  const [editingBlock, setEditingBlock] = useState<Block | null>(null)
  const [loading, setLoading] = useState(false)

  // Load blocks
  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const res = await fetch('/api/blocks')
        const data = await res.json()
        setBlocks(data.blocks || [])
      } catch (err) {
        console.error('Failed to fetch blocks', err)
      }
    }
    fetchBlocks()
  }, [setBlocks])

  const toggleVisibility = async (block: Block) => {
    const newVisible = !block.visible
    await fetch('/api/blocks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: block.id, visible: newVisible }),
    })
    updateBlock(block.id, { visible: newVisible })
  }

  const deleteBlock = async (id: string) => {
    if (!confirm('Delete this block permanently?')) return
    await fetch(`/api/blocks?id=${id}`, { method: 'DELETE' })
    removeBlock(id)
  }

  // Safe preview function - Fixed the undefined 'html' error
  const getBlockPreview = (block: Block): string => {
    const c = block.content as any

    const defaults: Record<string, string> = {
      text: c?.html ? c.html.replace(/<[^>]+>/g, ' ').slice(0, 80) : 'Text block',
      image: c?.url ? 'Image: ' + c.url.split('/').pop() : 'Image block',
      youtube: c?.url ? 'YouTube video' : 'YouTube block',
      instagram: 'Instagram post',
      linkedin: 'LinkedIn post',
      map: 'Map location',
      pdf: c?.filename || 'PDF document',
      testimonial: c?.quote ? `"${c.quote.slice(0, 60)}..."` : 'Testimonial',
      service: c?.title || 'Service offering',
      button: c?.label || 'Button',
      blog: c?.title || 'Blog post',
      skills: c?.title || 'Skills section',
      project: c?.title || 'Project',
      social: 'Social links',
      divider: 'Divider',
      contact: 'Contact form',
    }

    return defaults[block.type] || block.type
  }

  const handleAddBlock = async (type: string) => {
    setShowPicker(false)
    setLoading(true)

    const defaultContent: any = {
      text: { html: '<p>New text content here...</p>' },
      image: { url: '', caption: '', alt: '' },
      youtube: { url: '' },
      instagram: { url: '' },
      linkedin: { url: '' },
      map: { lat: 13.6288, lng: 79.4192, label: 'Location' },
      pdf: { url: '', filename: 'document.pdf' },
      testimonial: { quote: 'Great work!', name: 'Client Name', role: 'CEO' },
      service: { title: 'New Service', description: '', price: 999, currency: 'INR', features: [], isActive: true },
      button: { label: 'Click Me', url: '#', style: 'primary' },
      blog: { title: 'New Blog Post', excerpt: '', html: '<p>Blog content...</p>' },
      skills: { title: 'My Skills', skills: [], displayStyle: 'bars' },
      project: { title: 'New Project', description: '', tags: [] },
      social: { links: [], displayStyle: 'icons' },
      divider: { style: 'line', height: 40 },
      contact: {},
    }

    const newBlockPayload = {
      type,
      visible: true,
      animation: 'fadeIn' as const,
      content: defaultContent[type] || {},
      settings: { 
        maxWidth: 'lg' as const, 
        alignment: 'left' as const 
      },
      order: blocks.length + 1,
    }

    try {
      const res = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBlockPayload),
      })

      if (!res.ok) throw new Error('Failed to create')

      const { id } = await res.json()
      setBlocks([...blocks, { ...newBlockPayload, id } as Block])
    } catch (err) {
      alert('Failed to create block. Please try again.')
    }
    setLoading(false)
  }

  const handleSaveEdit = (updated: Block) => {
    updateBlock(updated.id, updated)
    setEditingBlock(null)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-syne text-4xl font-bold text-white">Blocks</h1>
          <p className="text-white/40 mt-1">Manage your portfolio content</p>
        </div>
        <button
          onClick={() => setShowPicker(true)}
          disabled={loading}
          className="flex items-center gap-2 bg-[#7ef0c8] hover:bg-[#5dd4aa] text-black px-6 py-3 rounded-2xl font-medium transition-colors disabled:opacity-70"
        >
          <Plus size={20} />
          Add Block
        </button>
      </div>

      <div className="space-y-3">
        {blocks.length === 0 && (
          <div className="bg-[#13131a] border border-white/10 rounded-3xl p-16 text-center">
            <p className="text-white/40">No blocks yet. Click "Add Block" to start building your portfolio.</p>
          </div>
        )}

        {blocks.map((block) => (
          <div
            key={block.id}
            className="group bg-[#13131a] border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:border-white/20 transition-all"
          >
            <GripVertical className="text-white/20 cursor-grab" size={22} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase font-mono tracking-widest bg-white/5 px-2.5 py-1 rounded-md">
                  {block.type}
                </span>
                <p className="text-white font-medium truncate">
                  {getBlockPreview(block)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => toggleVisibility(block)}
                className="p-2 hover:bg-white/10 rounded-xl"
              >
                {block.visible ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>

              <button
                onClick={() => setEditingBlock(block)}
                className="p-2 hover:bg-white/10 rounded-xl"
              >
                <Edit2 size={18} />
              </button>

              <button
                onClick={() => deleteBlock(block.id)}
                className="p-2 hover:bg-red-500/20 text-red-400 rounded-xl"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showPicker && (
        <BlockPicker
          onSelect={handleAddBlock}
          onClose={() => setShowPicker(false)}
        />
      )}

      {editingBlock && (
        <BlockEditor
          block={editingBlock}
          onSave={handleSaveEdit}
          onClose={() => setEditingBlock(null)}
        />
      )}
    </div>
  )
}