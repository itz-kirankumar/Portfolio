'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Field, Input, Select, SaveBar, Panel } from '@/components/admin/ui'
import { savePage } from '../actions'
import { Tiptap } from '../../publishing/[id]/Tiptap'
import type { CustomPage } from '@/lib/schemas/page'
import { useUI } from '@/lib/store/ui'

export function ClientEditor({ id, initialData }: { id: string; initialData: Partial<CustomPage> }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  
  const [data, setData] = useState<Partial<CustomPage>>({
    slug: initialData.slug || '',
    title: initialData.title || '',
    status: initialData.status || 'draft',
    html: initialData.html || '',
    doc: initialData.doc || '',
  })

  const update = (patch: Partial<CustomPage>) => {
    setData(prev => ({ ...prev, ...patch }))
    setDirty(true)
  }

  const handleSave = async () => {
    if (!data.title?.trim()) return alert('Title is required')
    if (!data.slug?.trim()) return alert('Slug is required')

    setSaving(true)
    // generate an id if new
    const targetId = id === 'new' ? crypto.randomUUID() : id
    
    // auto-format slug
    const cleanSlug = data.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    const payload = { ...data, slug: cleanSlug, id: targetId }
    const res = await savePage(targetId, payload)
    
    setSaving(false)
    if (res.ok) {
      setDirty(false)
      setSavedAt(Date.now())
      useUI.getState().toast('Page saved successfully')
      if (id === 'new') {
        router.replace(`/admin/pages/${res.id}`)
      }
    } else {
      alert(`Save failed: ${res.error}`)
    }
  }

  return (
    <div className="pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Input 
            value={data.title || ''} 
            onChange={e => update({ title: e.target.value })}
            placeholder="Page title"
            className="text-2xl font-display font-semibold py-3"
          />

          <Tiptap 
            initialContent={data.doc}
            onChange={(html, doc) => update({ html, doc })}
          />
        </div>

        <div className="space-y-6">
          <Panel title="Settings">
            <div className="space-y-4">
              <Field label="Status">
                <Select 
                  value={data.status || 'draft'} 
                  onChange={e => update({ status: e.target.value as any })}
                  options={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'published', label: 'Published' },
                  ]}
                />
              </Field>

              <Field label="URL Slug" help="e.g. 'about', 'contact', 'terms'">
                <Input 
                  value={data.slug || ''} 
                  onChange={e => update({ slug: e.target.value })}
                  placeholder="e.g. about-me"
                />
              </Field>

              {id !== 'new' && (
                <div className="pt-2">
                  <a 
                    href={`/p/${data.slug || id}`} 
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[0.82rem] font-medium text-coral-ink hover:text-coral-deep transition"
                  >
                    Open Live Page &nearr;
                  </a>
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>

      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={handleSave}
        savedAt={savedAt}
      />
    </div>
  )
}
