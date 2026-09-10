'use client'
// app/dashboard/blocks/page.tsx
import { useState, useEffect } from 'react'
import { Plus, GripVertical, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
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
        
        // Ensure blocks are sorted by order when loaded
        const sortedBlocks = (data.blocks || []).sort((a: Block, b: Block) => a.order - b.order)
        setBlocks(sortedBlocks)
      } catch (err) {
        console.error('Failed to fetch blocks', err)
      }
    }
    fetchBlocks()
  }, [setBlocks])

  // --- MOBILE OPTIMIZED DRAG & DROP ---
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(blocks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Assign new sequential order numbers
    const updatedBlocks = items.map((block, index) => ({
      ...block,
      order: index + 1
    }))

    // Optimistic UI Update (Instant snap)
    setBlocks(updatedBlocks)

    // Background Save
    try {
      await Promise.all(updatedBlocks.map(b => 
        fetch('/api/blocks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: b.id, order: b.order })
        })
      ))
    } catch (err) {
      console.error('Failed to save block order:', err)
      alert('Failed to save order. Please refresh.')
    }
  }

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

  // Safe preview generator
  const getBlockPreview = (block: Block): string => {
    const c = block.content as any
    const defaults: Record<string, string> = {
      text: c?.html ? c.html.replace(/<[^>]+>/g, ' ').slice(0, 40) + '...' : 'Text block',
      image: c?.url ? 'Image: ' + c.url.split('/').pop()?.slice(0, 20) : 'Image block',
      youtube: c?.title || 'YouTube video',
      instagram: 'Instagram post',
      linkedin: 'LinkedIn post',
      map: c?.label || 'Map location',
      pdf: c?.filename || 'PDF document',
      testimonial: c?.name || 'Testimonial',
      experience: c?.title || 'Experience',
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

    // ... (Your existing defaultContent logic here) ...
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
      experience: { title: 'Experience', items: [] }
    }

    const newBlockPayload = {
      type,
      visible: true,
      animation: 'fadeIn' as const,
      content: defaultContent[type] || {},
      settings: { maxWidth: 'lg' as const, alignment: 'left' as const },
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
    <div className="max-w-4xl mx-auto pb-24">
      {/* Mobile-optimized Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-syne text-3xl sm:text-4xl font-bold text-white">Blocks</h1>
          <p className="text-white/40 mt-1 text-sm sm:text-base">Drag to reorder your content</p>
        </div>
        <button
          onClick={() => setShowPicker(true)}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-[#7ef0c8] hover:bg-[#5dd4aa] text-black px-6 py-3.5 sm:py-3 rounded-2xl font-bold transition-colors disabled:opacity-70 w-full sm:w-auto"
        >
          <Plus size={20} />
          {loading ? 'Adding...' : 'Add Block'}
        </button>
      </div>

      {blocks.length === 0 && (
        <div className="bg-[#13131a] border border-white/10 rounded-3xl p-10 sm:p-16 text-center">
          <p className="text-white/40">No blocks yet. Click "Add Block" to start building your portfolio.</p>
        </div>
      )}

      {/* DRAG AND DROP CONTEXT */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="portfolio-blocks">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef} 
              className="space-y-3"
            >
              {blocks.map((block, index) => (
                <Draggable key={block.id} draggableId={block.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`group bg-[#13131a] border rounded-2xl p-3 sm:p-5 flex items-center gap-2 sm:gap-4 transition-all ${
                        snapshot.isDragging 
                          ? 'border-[#7ef0c8] shadow-[0_0_30px_rgba(126,240,200,0.15)] z-50 scale-[1.02]' 
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* 
                        TOUCH-NONE is crucial here: it stops mobile browsers from trying to scroll 
                        when the user drags the handle, enabling smooth drag and drop! 
                      */}
                      <div 
                        {...provided.dragHandleProps} 
                        className="p-2 -ml-2 text-white/20 hover:text-white/60 cursor-grab active:cursor-grabbing touch-none"
                      >
                        <GripVertical size={24} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <span className="text-[10px] sm:text-xs uppercase font-mono tracking-widest bg-white/5 px-2 py-1 rounded w-fit text-white/50">
                            {block.type}
                          </span>
                          <p className="text-white text-sm sm:text-base font-medium truncate">
                            {getBlockPreview(block)}
                          </p>
                        </div>
                      </div>

                      {/* Mobile Optimization: Opacity is 100 on mobile, hover effect only on desktop */}
                      <div className="flex items-center gap-0.5 sm:gap-1 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleVisibility(block)}
                          className="p-2.5 sm:p-2 hover:bg-white/10 rounded-xl text-white/80 transition-colors"
                        >
                          {block.visible ? <Eye size={18} /> : <EyeOff size={18} className="text-red-400" />}
                        </button>

                        <button
                          onClick={() => setEditingBlock(block)}
                          className="p-2.5 sm:p-2 hover:bg-[#7ef0c8]/20 hover:text-[#7ef0c8] rounded-xl text-white/80 transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>

                        <button
                          onClick={() => deleteBlock(block.id)}
                          className="p-2.5 sm:p-2 hover:bg-red-500/20 text-white/80 hover:text-red-400 rounded-xl transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {showPicker && (
        <BlockPicker onSelect={handleAddBlock} onClose={() => setShowPicker(false)} />
      )}

      {editingBlock && (
        <BlockEditor block={editingBlock} onSave={handleSaveEdit} onClose={() => setEditingBlock(null)} />
      )}
    </div>
  )
}