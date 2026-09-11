'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUI } from '@/lib/store/ui'
import { saveMedia, deleteMedia } from '../actions'
import { Field, Input, Select, SaveBar, Panel, BTN_PRIMARY, GHOST_BTN } from '@/components/admin/ui'
import { Image as ImageIcon, Link as LinkIcon, UploadCloud, Loader2, Trash2 } from 'lucide-react'
import type { Media, MediaKind } from '@/lib/schemas/media'

export default function MediaEditor({ initialData, id }: { initialData: Partial<Media>, id: string | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fetchingEmbed, setFetchingEmbed] = useState(false)
  
  const [data, setData] = useState<Partial<Media>>(initialData || {
    kind: 'image',
    tags: [],
    featured: false,
    title: '',
    caption: '',
    alt: '',
  })

  const [dirty, setDirty] = useState(false)
  const [embedUrl, setEmbedUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const update = (patch: Partial<Media>) => {
    setData(prev => ({ ...prev, ...patch }))
    setDirty(true)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'gallery')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      let json
      try {
        json = await res.json()
      } catch (e) {
        throw new Error(`Upload failed (Status ${res.status}). Ensure the file is under 4.5MB.`)
      }

      if (!res.ok) throw new Error(json.error || 'Upload failed')

      update({
        url: json.url,
        storagePath: json.path,
        kind: json.kind,
        contentType: json.contentType,
        bytes: json.bytes,
        title: data.title || file.name.split('.')[0]
      })
      useUI.getState().toast('File uploaded successfully')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleFetchEmbed = async () => {
    if (!embedUrl) return
    setFetchingEmbed(true)
    try {
      const res = await fetch(`/api/oembed?url=${encodeURIComponent(embedUrl)}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Fetch failed')

      update({
        url: json.url,
        kind: 'embed',
        platform: json.platform,
        title: data.title || json.title,
        thumbUrl: json.thumbUrl,
        authorName: json.authorName
      })
      useUI.getState().toast('Embed data fetched')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setFetchingEmbed(false)
      setEmbedUrl('')
    }
  }

  const handleSave = async () => {
    if (!data.url) return alert('Media URL is required. Please upload a file or add an embed.')
    setLoading(true)
    
    try {
      const payload = {
        kind: data.kind || 'image',
        platform: data.platform || null,
        url: data.url,
        storagePath: data.storagePath || '',
        thumbUrl: data.thumbUrl || '',
        title: data.title || '',
        caption: data.caption || '',
        alt: data.alt || '',
        tags: data.tags || [],
        featured: data.featured || false,
        width: data.width || 0,
        height: data.height || 0,
        bytes: data.bytes || 0,
        contentType: data.contentType || '',
        authorName: data.authorName || '',
      }

      const res = await saveMedia(id, payload)
      if (res.ok) {
        useUI.getState().toast('Media saved successfully')
        setDirty(false)
        if (!id) {
          router.replace(`/admin/media/${res.id}`)
        }
      } else {
        alert((res as any).error)
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    if (!confirm('Delete this media? This cannot be undone.')) return
    setLoading(true)
    const res = await deleteMedia(id)
    if (res.ok) {
      useUI.getState().toast('Media deleted')
      router.push('/admin/media')
    } else {
      alert((res as any).error)
      setLoading(false)
    }
  }

  const hasMedia = !!data.url

  return (
    <div className="pb-32 space-y-8">
      {/* Upload & Embed Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Direct Upload */}
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-rule rounded-xl bg-paper transition hover:border-coral-soft">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleUpload} 
            className="hidden" 
            accept="image/*,video/*,application/pdf"
          />
          <UploadCloud className="size-8 text-coral-deep mb-3" />
          <h3 className="font-semibold text-ink">Direct Upload</h3>
          <p className="text-[0.8rem] text-ink-soft mt-1 mb-4 text-center">Images, PDFs, MP4s. Auto-detects type and size.</p>
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={uploading}
            className={BTN_PRIMARY}
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : 'Select File'}
          </button>
        </div>

        {/* Embed Link */}
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-rule rounded-xl bg-paper">
          <LinkIcon className="size-8 text-stone-400 mb-3" />
          <h3 className="font-semibold text-ink">Embed URL</h3>
          <p className="text-[0.8rem] text-ink-soft mt-1 mb-4 text-center">YouTube, Instagram, X, Maps, etc.</p>
          <div className="flex w-full max-w-xs items-center gap-2">
            <Input 
              value={embedUrl}
              onChange={e => setEmbedUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1"
              onKeyDown={e => e.key === 'Enter' && handleFetchEmbed()}
            />
            <button 
              onClick={handleFetchEmbed}
              disabled={fetchingEmbed || !embedUrl}
              className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {fetchingEmbed ? <Loader2 className="size-4 animate-spin" /> : 'Fetch'}
            </button>
          </div>
        </div>
      </div>

      {hasMedia && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Panel title="Media Details">
              <div className="space-y-4">
                <Field label="Title" help="Internal name or display title">
                  <Input 
                    value={data.title || ''} 
                    onChange={e => update({ title: e.target.value })} 
                  />
                </Field>
                <Field label="Caption" help="Displayed under the media in galleries">
                  <Input 
                    value={data.caption || ''} 
                    onChange={e => update({ caption: e.target.value })} 
                  />
                </Field>
                <Field label="Alt Text" help="Screen-reader description (important for SEO)">
                  <Input 
                    value={data.alt || ''} 
                    onChange={e => update({ alt: e.target.value })} 
                  />
                </Field>
                <Field label="Tags (comma separated)">
                  <Input 
                    value={data.tags?.join(', ') || ''} 
                    onChange={e => {
                      const val = e.target.value
                      update({ tags: val ? val.split(',').map(t => t.trim()).filter(Boolean) : [] })
                    }} 
                  />
                </Field>
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title="Preview">
              <div className="aspect-square bg-paper-deep rounded-lg overflow-hidden border border-rule relative flex items-center justify-center">
                {data.kind === 'image' || data.thumbUrl ? (
                  <img src={data.thumbUrl || data.url} alt="" className="object-cover w-full h-full" />
                ) : data.kind === 'video' ? (
                  <video src={data.url} controls className="w-full max-h-full" />
                ) : (
                  <div className="p-4 text-center">
                    <p className="font-semibold text-ink break-all">{data.platform || data.kind}</p>
                    <a href={data.url} target="_blank" rel="noreferrer" className="text-[0.75rem] text-coral-ink mt-2 break-all line-clamp-2">
                      {data.url}
                    </a>
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <label className="flex items-center gap-2 text-[0.85rem] font-medium text-ink cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={data.featured || false} 
                    onChange={e => update({ featured: e.target.checked })} 
                    className="rounded border-rule text-coral focus:ring-coral-soft"
                  />
                  Feature on Home
                </label>
              </div>
            </Panel>

            <Panel title="System Data">
              <div className="space-y-2 text-[0.75rem] font-mono text-ink-soft">
                <div className="flex justify-between border-b border-rule/50 pb-1">
                  <span>Kind:</span> <span className="text-ink">{data.kind}</span>
                </div>
                {data.platform && (
                  <div className="flex justify-between border-b border-rule/50 pb-1">
                    <span>Platform:</span> <span className="text-ink">{data.platform}</span>
                  </div>
                )}
                {data.contentType && (
                  <div className="flex justify-between border-b border-rule/50 pb-1">
                    <span>Type:</span> <span className="text-ink">{data.contentType}</span>
                  </div>
                )}
                {!!data.bytes && (
                  <div className="flex justify-between border-b border-rule/50 pb-1">
                    <span>Size:</span> <span className="text-ink">{(data.bytes / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                )}
              </div>
            </Panel>

            {id && (
              <button 
                onClick={handleDelete}
                className={`${GHOST_BTN} w-full flex justify-center text-red-600 hover:text-red-700 hover:bg-red-50`}
              >
                <Trash2 className="size-4 mr-2" /> Delete Media
              </button>
            )}
          </div>
        </div>
      )}

      <SaveBar
        dirty={dirty}
        saving={loading}
        onSave={handleSave}
      />
    </div>
  )
}
