'use client'
import { useUI as useToast } from '@/lib/store/ui'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Field, Input, Textarea, Select, Toggle, SaveBar, Panel } from '@/components/admin/ui'
import { savePost } from '../actions'
import { Tiptap } from './Tiptap'
import type { Post } from '@/lib/schemas/post'

export default function ClientEditor({ initialData, id }: { initialData: Partial<Post>, id: string }) {
  const router = useRouter()
  
  // Provide defaults
  const [data, setData] = useState<Partial<Post>>({
    slug: initialData.slug || '',
    title: initialData.title || '',
    excerpt: initialData.excerpt || '',
    coverUrl: initialData.coverUrl || '',
    tags: initialData.tags || [],
    status: initialData.status || 'draft',
    html: initialData.html || '',
    doc: initialData.doc || '',
    newsletter: initialData.newsletter || {
      enabled: false,
      subject: '',
      status: 'idle',
      sentAt: 0,
      recipients: 0,
      error: '',
    }
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [issues, setIssues] = useState<string[]>([])
  
  const dirty = JSON.stringify(data) !== JSON.stringify(initialData)

  async function handleSave() {
    setSaving(true)
    setError(null)
    setIssues([])
    
    // Auto-generate slug from title if missing and is new
    let savePayload = { ...data }
    if (id === 'new' && !savePayload.slug && savePayload.title) {
      savePayload.slug = savePayload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      setData(savePayload)
    }

    const result = await savePost(savePayload.slug || id, savePayload)
    
    setSaving(false)
    if (result.success) {
      useToast.getState().toast('Saved successfully!')
      if (id === 'new') {
        router.push(`/admin/publishing/${savePayload.slug}`)
      }
      router.refresh()
    } else {
      setError(result.error || 'Unknown error occurred')
      if (result.issues) {
        setIssues(result.issues)
      }
    }
  }

  const update = (changes: Partial<Post>) => {
    setData((prev) => ({ ...prev, ...changes }))
  }

  const updateNewsletter = (changes: any) => {
    setData((prev) => ({ ...prev, newsletter: { ...prev.newsletter, ...changes } as any }))
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Input 
            value={data.title || ''} 
            onChange={e => update({ title: e.target.value })}
            placeholder="Post title"
            className="text-2xl font-display font-semibold py-3"
          />

          <Tiptap 
            initialContent={data.doc}
            onChange={(html, doc) => update({ html, doc })}
          />
          
          <Panel title="Excerpt">
            <Textarea
              value={data.excerpt || ''}
              onChange={e => update({ excerpt: e.target.value })}
              placeholder="A short summary of the post..."
              rows={3}
            />
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Publishing">
            <div className="space-y-4">
              <Field label="Status">
                <Select 
                  value={data.status || 'draft'} 
                  onChange={e => update({ status: e.target.value as any })}
                  options={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'scheduled', label: 'Scheduled' },
                    { value: 'published', label: 'Published' },
                  ]}
                />
              </Field>

              <Field label="URL Slug" help="Lowercase letters and dashes only.">
                <Input 
                  value={data.slug || ''} 
                  onChange={e => update({ slug: e.target.value })}
                  placeholder="e.g. my-first-post"
                />
              </Field>
              
              <Field label="Cover Image URL">
                <Input 
                  value={data.coverUrl || ''} 
                  onChange={e => update({ coverUrl: e.target.value })}
                  placeholder="https://..."
                />
              </Field>
              
              <Field label="Tags" help="Comma-separated">
                <Input 
                  value={data.tags?.join(', ') || ''} 
                  onChange={e => update({ tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  placeholder="design, coding"
                />
              </Field>

              {id !== 'new' && (
                <div className="pt-2">
                  <a 
                    href={`/writing/${id}?preview=true`} 
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[0.82rem] font-medium text-coral-ink hover:text-coral-deep transition"
                  >
                    Open Live Preview &nearr;
                  </a>
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Newsletter">
            <div className="space-y-4">
              <Toggle 
                label="Send as Newsletter"
                help="If enabled, this post will be sent to your subscribers when published."
                checked={data.newsletter?.enabled || false}
                onChange={checked => updateNewsletter({ enabled: checked })}
              />
              
              {data.newsletter?.enabled && (
                <Field label="Subject Line" help="Leave empty to use the post title.">
                  <Input 
                    value={data.newsletter?.subject || ''} 
                    onChange={e => updateNewsletter({ subject: e.target.value })}
                    placeholder={data.title || "Subject line"}
                  />
                </Field>
              )}
            </div>
          </Panel>
        </div>
      </div>

      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={handleSave}
        onReset={() => setData(initialData)}
        error={error}
        issues={issues}
      />
    </>
  )
}
