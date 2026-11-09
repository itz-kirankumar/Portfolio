'use client'
import { useUI as useToast } from '@/lib/store/ui'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Field, Input, Textarea, Toggle, SaveBar, Panel, Modal } from '@/components/admin/ui'
import { savePost, deletePost } from '../actions'
import { Tiptap } from './Tiptap'
import type { Post } from '@/lib/schemas/post'

export default function ClientEditor({ initialData, id }: { initialData: Partial<Post>, id: string }) {
  const router = useRouter()
  
  // Provide defaults
  // Same-shape snapshot as the initial state, so `dirty` only flips when the
  // owner actually edits something - not because the doc carries extra fields.
  const shape = (d: Partial<Post>): Partial<Post> => ({
    slug: d.slug || '',
    title: d.title || '',
    excerpt: d.excerpt || '',
    coverUrl: d.coverUrl || '',
    tags: d.tags || [],
    status: d.status || 'draft',
    publishedAt: d.publishedAt || 0,
    createdAt: d.createdAt || 0,
    html: d.html || '',
    doc: d.doc || '',
    newsletter: d.newsletter || {
      enabled: false,
      subject: '',
      status: 'idle',
      sentAt: 0,
      recipients: 0,
      error: '',
    }
  })
  const [initialSnap] = useState<Partial<Post>>(() => shape(initialData))
  const [data, setData] = useState<Partial<Post>>({
    slug: initialData.slug || '',
    title: initialData.title || '',
    excerpt: initialData.excerpt || '',
    coverUrl: initialData.coverUrl || '',
    tags: initialData.tags || [],
    status: initialData.status || 'draft',
    // Editing must never move the original publication date or order:
    // carry the stored timestamps through every save/autosave.
    publishedAt: initialData.publishedAt || 0,
    createdAt: initialData.createdAt || 0,
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
  
  const dirty = JSON.stringify(data) !== JSON.stringify(initialSnap)

    // Auto-save logic
  const saveTimeoutRef = useRef<NodeJS.Timeout>(null)
  
  useEffect(() => {
    // Only auto-save if it's not a new post, is dirty, and not currently saving
    if (id !== 'new' && dirty && !saving) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      
      saveTimeoutRef.current = setTimeout(() => {
        handleSave(true)
      }, 5000)
    }
    
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [data, dirty, id, saving])

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const result = await deletePost(id)
    setDeleting(false)
    if (result.success) {
      useToast.getState().toast('Post deleted')
      router.push('/admin/publishing')
      router.refresh()
    } else {
      setError(result.error || 'Delete failed')
      setConfirmDelete(false)
    }
  }

  async function handleSave(isAutoSave = false, statusOverride?: 'draft' | 'published') {
    if (typeof isAutoSave !== 'boolean') isAutoSave = false
    setSaving(true)
    setError(null)
    setIssues([])
    
    // Auto-generate slug from title if missing and is new
    let savePayload = { ...data }
    if (statusOverride) {
      savePayload.status = statusOverride
      setData((prev) => ({ ...prev, status: statusOverride }))
    }
    if (id === 'new' && !savePayload.slug && savePayload.title) {
      savePayload.slug = savePayload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      setData(savePayload)
    }

    const result = await savePost(savePayload.slug || id, savePayload)
    
    setSaving(false)
        if (result.success) {
      if (!isAutoSave) {
        useToast.getState().toast('Saved successfully!')
      }
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
              <div className="flex items-center justify-between">
                <span className="block font-mono text-[0.66rem] uppercase tracking-[0.13em] text-ink-soft">Status</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-[0.12em] ${data.status === 'published' ? 'bg-coral-soft text-coral-ink' : 'bg-paper-deep text-ink-soft'}`}>
                  <span className={`size-1.5 rounded-full ${data.status === 'published' ? 'bg-coral' : 'bg-ink-soft/60'}`} />
                  {data.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
              {data.status === 'published' && data.publishedAt ? (
                <p className="font-mono text-[0.68rem] text-ink-soft">
                  First published {new Date(data.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} - edits never change this.
                </p>
              ) : null}
              <div className="flex flex-col gap-2">
                {data.status !== 'published' ? (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSave(false, 'published')}
                    className="w-full rounded-lg bg-coral-deep px-4 py-2.5 text-[0.9rem] font-medium text-white transition hover:bg-coral-ink disabled:opacity-50"
                  >
                    Publish now
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSave(false, 'draft')}
                    className="w-full rounded-lg bg-card px-4 py-2.5 text-[0.9rem] font-medium text-ink ring-1 ring-rule transition hover:ring-coral/60 disabled:opacity-50"
                  >
                    Unpublish (back to draft)
                  </button>
                )}
                {id !== 'new' && (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="w-full rounded-lg px-4 py-2 text-[0.82rem] font-medium text-red-400 transition hover:bg-red-500/10"
                  >
                    Delete this post…
                  </button>
                )}
              </div>

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
                  onChange={e => update({ tags: e.target.value.split(',').map(s => s.trim().replace(/^#+/, '')).filter(Boolean) })}
                  placeholder="Startups, Fintech, AI"
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
                    Open Live Preview ↗
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
        onSave={() => handleSave(false)}
        onReset={() => setData(initialData)}
        error={error}
        issues={issues}
      />

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={`Delete "${data.title || id}"?`}
        description="This permanently removes the post and its public URL. This cannot be undone."
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg px-4 py-2 text-[0.88rem] font-medium text-ink-soft transition hover:text-ink"
            >
              Keep it
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="rounded-lg bg-red-500 px-4 py-2 text-[0.88rem] font-medium text-white transition hover:bg-red-400 disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Delete permanently'}
            </button>
          </>
        }
      >
        <p className="text-[0.9rem] text-ink-soft">The post is removed from the site immediately. Drafts and other posts are not affected.</p>
      </Modal>
    </>
  )
}
