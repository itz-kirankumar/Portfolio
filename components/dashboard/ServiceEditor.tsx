'use client'
// components/dashboard/ServiceEditor.tsx
import { useState } from 'react'
import { X, Save, Plus, Trash2 } from 'lucide-react'
import type { ServiceContent } from '@/types'

interface Props {
  block: any // We receive the full block for editing
  onSave: (updatedContent: ServiceContent) => void
  onClose: () => void
}

export default function ServiceEditor({ block, onSave, onClose }: Props) {
  const initialContent = block.content as ServiceContent

  const [content, setContent] = useState<ServiceContent>({
    title: initialContent.title || '',
    description: initialContent.description || '',
    price: initialContent.price || 999,
    currency: initialContent.currency || 'INR',
    duration: initialContent.duration || '60 mins',
    features: initialContent.features || [],
    ctaText: initialContent.ctaText || 'Book Now',
    calendlyUrl: initialContent.calendlyUrl || '',
    isActive: initialContent.isActive ?? true,
  })

  const [saving, setSaving] = useState(false)
  const [newFeature, setNewFeature] = useState('')

  const handleChange = (key: keyof ServiceContent, value: any) => {
    setContent(prev => ({ ...prev, [key]: value }))
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setContent(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }))
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setContent(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/blocks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: block.id,
          content,
          settings: block.settings
        }),
      })

      onSave(content)
      onClose()
    } catch (err) {
      console.error(err)
      alert('Failed to save service')
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-[#0d0d14] border border-white/10 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-syne text-2xl font-bold text-white">Edit Service</h2>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Title */}
          <div>
            <label className="text-white/50 text-xs mb-2 block">Service Title</label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full bg-[#13131a] border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:border-[#7ef0c8]"
              placeholder="1:1 Mentorship Session"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-white/50 text-xs mb-2 block">Description</label>
            <textarea
              value={content.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full bg-[#13131a] border border-white/10 rounded-2xl px-4 py-3.5 text-white resize-y focus:border-[#7ef0c8]"
              placeholder="Describe what clients will get..."
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-white/50 text-xs mb-2 block">Price</label>
              <input
                type="number"
                value={content.price}
                onChange={(e) => handleChange('price', Number(e.target.value))}
                className="w-full bg-[#13131a] border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:border-[#7ef0c8]"
              />
            </div>
            <div>
              <label className="text-white/50 text-xs mb-2 block">Currency</label>
              <select
                value={content.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full bg-[#13131a] border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:border-[#7ef0c8]"
              >
                <option value="INR">INR ₹</option>
                <option value="USD">USD $</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-white/50 text-xs mb-2 block">Duration</label>
            <input
              type="text"
              value={content.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
              className="w-full bg-[#13131a] border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:border-[#7ef0c8]"
              placeholder="60 mins"
            />
          </div>

          {/* Features */}
          <div>
            <label className="text-white/50 text-xs mb-3 block">Features</label>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add a feature..."
                className="flex-1 bg-[#13131a] border border-white/10 rounded-2xl px-4 py-3 text-white"
                onKeyDown={(e) => e.key === 'Enter' && addFeature()}
              />
              <button
                onClick={addFeature}
                className="bg-[#7ef0c8] text-black px-6 rounded-2xl font-medium hover:bg-white transition-colors"
              >
                Add
              </button>
            </div>

            <div className="space-y-2">
              {content.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 bg-[#1a1a24] border border-white/10 rounded-2xl px-4 py-3 group">
                  <span className="flex-1 text-white/80">{feature}</span>
                  <button
                    onClick={() => removeFeature(index)}
                    className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Text */}
          <div>
            <label className="text-white/50 text-xs mb-2 block">CTA Button Text</label>
            <input
              type="text"
              value={content.ctaText}
              onChange={(e) => handleChange('ctaText', e.target.value)}
              className="w-full bg-[#13131a] border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:border-[#7ef0c8]"
            />
          </div>

          {/* Calendly URL */}
          <div>
            <label className="text-white/50 text-xs mb-2 block">Calendly / Booking URL (optional)</label>
            <input
              type="text"
              value={content.calendlyUrl || ''}
              onChange={(e) => handleChange('calendlyUrl', e.target.value)}
              placeholder="https://calendly.com/..."
              className="w-full bg-[#13131a] border border-white/10 rounded-2xl px-4 py-3.5 text-white focus:border-[#7ef0c8]"
            />
          </div>

          {/* Active Status */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={content.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="w-5 h-5 accent-[#7ef0c8]"
            />
            <span className="text-white">Service is active and bookable</span>
          </label>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-4 bg-[#7ef0c8] text-black font-semibold rounded-2xl hover:bg-[#5dd4aa] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Service'}
          </button>
        </div>
      </div>
    </div>
  )
}