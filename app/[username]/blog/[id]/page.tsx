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
    if (!confirm('Delete this block?')) return
    await fetch(`/api/blocks?id=${id}`, { method: 'DELETE' })
    removeBlock(id)
  }

  const handleAddBlock = async (type: string) => {
    setShowPicker(false)
    setLoading(true)

    const defaultContent: any = {
      text: { html: '<p>New text block</p>' },
      image: { url: '' },
      youtube: { url: '' },
      instagram: { url: '' },
      linkedin: { url: '' },
      map: { lat: 13.6288, lng: 79.4192 },
      pdf: { url: '', filename: 'document.pdf' },
      testimonial: { quote: '', name: '', role: '' },
      service: { title: 'New Service', description: '', price: 999, currency: 'INR', features: [], isActive: true },
      button: { label: 'Click Me', url: '#', style: 'primary' },
      blog: { title: 'New Blog', excerpt: '', html: '' },
      skills: { title: 'Skills', skills: [], displayStyle: 'bars' },
      project: { title: 'New Project', description: '', tags: [] },
      social: { links: [], displayStyle: 'icons' },
      divider: { style: 'line' },
    }

    const newBlock = {
      type,
      visible: true,
      animation: 'fadeIn' as const,
      content: defaultContent[type] || {},
      settings: { maxWidth: 'lg', alignment: 'left' },
      order: blocks.length + 1,
    }

    try {
      const res = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBlock),
      })
      const { id } = await res.json()

      setBlocks([...blocks, { ...newBlock, id } as Block])
    } catch (err) {
      alert('Failed to create block')
    }
    setLoading(false)
  }

  const handleSaveEdit = (updated: Block) => {
    updateBlock(updated.id, updated)
    setEditingBlock(null)
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-syne text-4xl font-bold text-white">Blocks</h1>
          <p className="text-white/40 mt-1">Drag to reorder • Click pencil to edit</p>
        </div>
        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-2 bg-[#7ef0c8] text-black px-5 py-3 rounded-2xl font-medium hover:bg-[#5dd4aa] transition-colors"
        >
          <Plus size={20} />
          Add Block
        </button>
      </div>

      <div className="space-y-3">
        {blocks.length === 0 && (
          <div className="text-center py-20 text-white/40">
            No blocks yet. Click "Add Block" to get started.
          </div>
        )}

        {blocks.map((block, index) => (
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
                  {(block.content as any).title || 
                   (block.content as any).quote || 
                   (block.content as any).label || 
                   block.type}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
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

      {/* Block Picker Modal */}
      {showPicker && (
        <BlockPicker
          onSelect={handleAddBlock}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* Block Editor Modal */}
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