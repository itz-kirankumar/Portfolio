'use client'
// components/dashboard/BlockGroupingControls.tsx
import type { Block } from '@/types'

interface Props {
  block: Block
  onUpdate: (data: Partial<Block>) => void
}

export default function BlockGroupingControls({ block, onUpdate }: Props) {
  const settings = block.settings || {}

  return (
    <div className="space-y-6 pt-6 border-t border-white/10">
      <h3 className="font-syne text-lg font-semibold text-white">Advanced Layout & Grouping</h3>

      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.groupWithPrevious || false}
            onChange={(e) => onUpdate({
              settings: { ...settings, groupWithPrevious: e.target.checked }
            })}
            className="w-5 h-5 accent-[#7ef0c8]"
          />
          <div>
            <p className="text-white">Group with previous block</p>
            <p className="text-white/40 text-sm">Useful for creating grids and masonry layouts</p>
          </div>
        </label>

        <div>
          <label className="text-white/50 text-xs mb-2 block">Display Mode</label>
          <select
            value={settings.displayMode || 'single'}
            onChange={(e) => onUpdate({
              settings: { ...settings, displayMode: e.target.value as any }
            })}
            className="w-full bg-[#13131a] border border-white/10 rounded-2xl px-4 py-3 text-white"
          >
            <option value="single">Single Column</option>
            <option value="grid-2">2 Column Grid</option>
            <option value="grid-3">3 Column Grid</option>
            <option value="masonry">Masonry Layout</option>
          </select>
        </div>

        <div>
          <label className="text-white/50 text-xs mb-2 block">Section Title (Optional)</label>
          <input
            type="text"
            value={settings.sectionTitle || ''}
            onChange={(e) => onUpdate({
              settings: { ...settings, sectionTitle: e.target.value }
            })}
            placeholder="Featured Work"
            className="w-full bg-[#13131a] border border-white/10 rounded-2xl px-4 py-3 text-white"
          />
        </div>

        <div>
          <label className="text-white/50 text-xs mb-2 block">Section Description</label>
          <textarea
            value={settings.sectionDescription || ''}
            onChange={(e) => onUpdate({
              settings: { ...settings, sectionDescription: e.target.value }
            })}
            placeholder="Some of my recent projects and services"
            rows={3}
            className="w-full bg-[#13131a] border border-white/10 rounded-2xl px-4 py-3 text-white resize-y"
          />
        </div>
      </div>
    </div>
  )
}