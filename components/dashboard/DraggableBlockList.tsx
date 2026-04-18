'use client'
// components/dashboard/DraggableBlockList.tsx
import { useState } from 'react'
import { GripVertical, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react'
import type { Block } from '@/types'

export default function DraggableBlockList({ blocks, onUpdate }: { blocks: Block[], onUpdate: (b: Block[]) => void }) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const toggleVisibility = async (block: Block) => {
    const updated = { ...block, visible: !block.visible }
    await fetch('/api/blocks', {
      method: 'PUT',
      body: JSON.stringify({ id: block.id, visible: !block.visible })
    })
    onUpdate(blocks.map(b => b.id === block.id ? updated : b))
  }

  // --- Drag and Drop Logic ---
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return

    const newBlocks = [...blocks]
    const draggedBlock = newBlocks[draggedIndex]
    
    newBlocks.splice(draggedIndex, 1)
    newBlocks.splice(index, 0, draggedBlock)

    // Update local state instantly for smooth UI
    const reordered = newBlocks.map((b, i) => ({ ...b, order: i }))
    onUpdate(reordered)
    setDraggedIndex(index)
  }

  const handleDragEnd = async () => {
    setDraggedIndex(null)
    
    // Persist new order to backend silently
    try {
      await Promise.all(blocks.map(b => 
        fetch('/api/blocks', { 
          method: 'PUT', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: b.id, order: b.order }) 
        })
      ))
    } catch (err) {
      console.error('Failed to save new block order:', err)
    }
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => (
        <div 
          key={block.id} 
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragEnter={() => handleDragEnter(index)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => e.preventDefault()}
          className={`flex items-center gap-4 p-4 bg-[#13131a] border rounded-2xl group transition-all ${
            draggedIndex === index 
              ? 'opacity-40 scale-[0.98] border-[#7ef0c8] shadow-[0_0_20px_rgba(126,240,200,0.15)]' 
              : 'border-white/5 hover:border-[#7ef0c8]/30'
          }`}
        >
          <div className="cursor-grab active:cursor-grabbing p-1 -ml-2 text-white/10 group-hover:text-white/40 transition-colors">
            <GripVertical size={20} />
          </div>
          
          <div className="flex-1 min-w-0 pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-white/50 uppercase font-bold tracking-tighter">
                {block.type}
              </span>
              <h4 className="text-white font-medium truncate">
                {(block.content as any).title || (block.content as any).quote || (block.content as any).label || 'Untitled Block'}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => toggleVisibility(block)} className="p-2 rounded-lg text-white/30 hover:text-[#7ef0c8] hover:bg-[#7ef0c8]/10 transition-colors">
              {block.visible ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
            <button className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors">
              <Edit2 size={18} />
            </button>
            <button className="p-2 rounded-lg text-white/10 hover:text-red-500 hover:bg-red-500/10 transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}