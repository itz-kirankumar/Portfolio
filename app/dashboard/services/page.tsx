'use client'
// app/dashboard/services/page.tsx
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import type { Block, ServiceContent } from '@/types'

export default function ServicesPage() {
  const [services, setServices] = useState<Block[]>([])
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState<Block | null>(null)

  useEffect(() => {
    fetch('/api/blocks')
      .then(r => r.json())
      .then(d => {
        setServices(d.blocks?.filter((b: Block) => b.type === 'service') || [])
        setLoading(false)
      })
  }, [])

  const addService = async () => {
    const res = await fetch('/api/blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'service', order: services.length, visible: true, animation: 'fadeIn',
        content: {
          title: 'New Service', description: '', price: 999, currency: 'INR',
          duration: '60 mins', features: [], ctaText: 'Book Now', isActive: true,
        },
        settings: {},
      }),
    })
    const { id } = await res.json()
    const newBlock: Block = {
      id, type: 'service', order: services.length, visible: true, animation: 'fadeIn',
      content: { title: 'New Service', description: '', price: 999, currency: 'INR', duration: '60 mins', features: [], ctaText: 'Book Now', isActive: true } as ServiceContent,
      settings: {}, createdAt: Date.now(), updatedAt: Date.now(),
    }
    setServices(s => [...s, newBlock])
    setEditing(newBlock)
  }

  const toggleActive = async (block: Block) => {
    const c = block.content as ServiceContent
    const updated = { ...block, content: { ...c, isActive: !c.isActive } }
    setServices(s => s.map(b => b.id === block.id ? updated : b))
    await fetch('/api/blocks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: block.id, content: updated.content }),
    })
  }

  const deleteService = async (id: string) => {
    if (!confirm('Delete this service?')) return
    setServices(s => s.filter(b => b.id !== id))
    await fetch(`/api/blocks?id=${id}`, { method: 'DELETE' })
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-[#7ef0c8] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-syne text-2xl font-bold text-white mb-1">Services</h1>
          <p className="text-white/40 text-sm">Manage your 1:1 mentorship sessions and offerings</p>
        </div>
        <button
          onClick={addService}
          className="flex items-center gap-2 bg-[#7ef0c8] text-[#0a0a0f] font-medium text-sm px-4 py-2.5 rounded-xl hover:bg-[#5dd4aa] transition-colors"
        >
          <Plus size={16} />
          Add Service
        </button>
      </div>

      {services.length === 0 ? (
        <div
          onClick={addService}
          className="border-2 border-dashed border-white/[0.08] rounded-2xl p-16 text-center cursor-pointer hover:border-[#7ef0c8]/30 transition-colors"
        >
          <div className="text-4xl mb-3">💎</div>
          <p className="text-white/40 text-sm">No services yet. Click to add your first offering.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map(block => {
            const c = block.content as ServiceContent
            return (
              <div key={block.id} className="bg-[#13131a] border border-white/[0.07] rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium">{c.title || 'Untitled Service'}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? 'bg-[#7ef0c8]/10 text-[#7ef0c8]' : 'bg-white/5 text-white/30'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-white/40 text-sm truncate max-w-md">{c.description || 'No description'}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[#7ef0c8] font-syne font-bold">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: c.currency || 'INR', maximumFractionDigits: 0 }).format(c.price)}
                      </span>
                      {c.duration && <span className="text-white/30 text-xs">{c.duration}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleActive(block)}
                      className="p-2 rounded-lg text-white/30 hover:text-[#7ef0c8] hover:bg-[#7ef0c8]/[0.08] transition-all"
                      title={c.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {c.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>
                    <button
                      onClick={() => setEditing(block)}
                      className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-all"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => deleteService(block.id)}
                      className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editing && <ServiceEditorModal block={editing} onClose={() => setEditing(null)} onSave={(updated) => { setServices(s => s.map(b => b.id === updated.id ? updated : b)); setEditing(null) }} />}
    </div>
  )
}

// Inline modal for editing a service
function ServiceEditorModal({ block, onClose, onSave }: { block: Block; onClose: () => void; onSave: (b: Block) => void }) {
  const [c, setC] = useState<ServiceContent>(block.content as ServiceContent)
  const [featuresText, setFeaturesText] = useState(c.features?.join('\n') || '')
  const [saving, setSaving] = useState(false)

  const inputClass = 'w-full bg-[#13131a] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#7ef0c8]/40'

  const save = async () => {
    setSaving(true)
    const content = { ...c, features: featuresText.split('\n').map(f => f.trim()).filter(Boolean) }
    await fetch('/api/blocks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: block.id, content }),
    })
    onSave({ ...block, content })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0d0d14] border border-white/[0.08] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-syne font-bold text-white">Edit Service</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 text-xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div><label className="text-white/50 text-xs mb-1.5 block">Title</label><input value={c.title} onChange={e => setC(x => ({ ...x, title: e.target.value }))} className={inputClass} /></div>
          <div><label className="text-white/50 text-xs mb-1.5 block">Description</label><textarea value={c.description} onChange={e => setC(x => ({ ...x, description: e.target.value }))} rows={3} className={`${inputClass} resize-none`} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-white/50 text-xs mb-1.5 block">Price</label><input type="number" value={c.price} onChange={e => setC(x => ({ ...x, price: Number(e.target.value) }))} className={inputClass} /></div>
            <div><label className="text-white/50 text-xs mb-1.5 block">Currency</label>
              <select value={c.currency} onChange={e => setC(x => ({ ...x, currency: e.target.value as 'INR' | 'USD' }))} className={inputClass}>
                <option value="INR">INR ₹</option>
                <option value="USD">USD $</option>
              </select>
            </div>
            <div><label className="text-white/50 text-xs mb-1.5 block">Duration</label><input value={c.duration || ''} onChange={e => setC(x => ({ ...x, duration: e.target.value }))} placeholder="60 mins" className={inputClass} /></div>
          </div>
          <div><label className="text-white/50 text-xs mb-1.5 block">Features (one per line)</label><textarea value={featuresText} onChange={e => setFeaturesText(e.target.value)} rows={5} placeholder={"60 min call\nRecording included\nFollow-up notes"} className={`${inputClass} resize-none font-mono text-xs`} /></div>
          <div><label className="text-white/50 text-xs mb-1.5 block">Button Text</label><input value={c.ctaText} onChange={e => setC(x => ({ ...x, ctaText: e.target.value }))} className={inputClass} /></div>
          <div><label className="text-white/50 text-xs mb-1.5 block">Calendly / Booking URL (optional)</label><input value={c.calendlyUrl || ''} onChange={e => setC(x => ({ ...x, calendlyUrl: e.target.value }))} placeholder="https://calendly.com/..." className={inputClass} /></div>
        </div>
        <div className="px-6 pb-6">
          <button onClick={save} disabled={saving} className="w-full bg-[#7ef0c8] text-[#0a0a0f] font-medium py-3 rounded-xl hover:bg-[#5dd4aa] transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Service'}
          </button>
        </div>
      </div>
    </div>
  )
}