'use client'

import { useEffect, useState } from 'react'
import { X, Search } from 'lucide-react'
import { getAllMedia } from '../../media/actions'
import type { Media, MediaKind } from '@/lib/schemas/media'
import { Select } from '@/components/admin/ui'

export function MediaPickerModal({
  onClose,
  onSelect
}: {
  onClose: () => void
  onSelect: (media: Media) => void
}) {
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [filterKind, setFilterKind] = useState<MediaKind | 'all'>('all')

  useEffect(() => {
    getAllMedia().then(data => {
      setMedia(data)
      setLoading(false)
    })
  }, [])

  const filtered = media.filter(m => filterKind === 'all' || m.kind === filterKind)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-paper/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-rule bg-card shadow-paper">
        <div className="flex items-center justify-between border-b border-rule px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-ink">Media Library</h2>
          <button onClick={onClose} className="rounded-md p-1 text-ink-soft hover:bg-rule">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex items-center gap-4 border-b border-rule bg-paper-deep/50 px-5 py-3">
          <Select 
            value={filterKind} 
            onChange={e => setFilterKind(e.target.value as any)}
            options={[
              { value: 'all', label: 'All media' },
              { value: 'image', label: 'Images' },
              { value: 'video', label: 'Videos' },
              { value: 'embed', label: 'Embeds & Social' },
            ]}
          />
          <div className="text-[0.8rem] text-ink-soft ml-auto">
            {filtered.length} item{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="text-center text-ink-soft py-12">Loading media...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-ink-soft py-12">No media found.</div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map(item => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-rule bg-paper transition hover:border-coral"
                >
                  {item.kind === 'image' || !!item.thumbUrl ? (
                    <img 
                      src={item.thumbUrl || item.url} 
                      alt={item.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-4 text-[0.85rem] font-medium text-ink-soft break-words">
                      {item.title || item.kind}
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 p-3 pt-6 text-left">
                    <p className="truncate text-[0.75rem] font-medium text-white shadow-sm">
                      {item.title || 'Untitled'}
                    </p>
                    <p className="text-[0.65rem] text-white/80 capitalize">
                      {item.platform || item.kind}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
