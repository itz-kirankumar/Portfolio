'use client'
// components/dashboard/BlockEditor.tsx
import { useState } from 'react'
import { X, Save, Plus, Trash2 } from 'lucide-react'
import type { Block, BlockSettings, BlockContent } from '@/types'
import TiptapEditor from '@/components/editor/TiptapEditor'
import BlockGroupingControls from './BlockGroupingControls'
import ServiceEditor from './ServiceEditor'

interface Props {
  block: Block
  onSave: (updated: Block) => void
  onClose: () => void
}

export default function BlockEditor({ block, onSave, onClose }: Props) {
  // ------------------------------------------------------------------
  // CTO Note: Top-level delegation for specialized full-modal editors
  // This prevents rendering a fixed modal inside another fixed modal.
  // ------------------------------------------------------------------
  if (block.type === 'service') {
    return (
      <ServiceEditor
        block={block}
        onSave={(updatedContent) => {
          onSave({ ...block, content: updatedContent })
        }}
        onClose={onClose}
      />
    )
  }

  const [content, setContent] = useState<BlockContent>(block.content)
  const [settings, setSettings] = useState<BlockSettings>(block.settings || {})
  const [saving, setSaving] = useState(false)

  const updateContent = (key: string, value: any) => {
    setContent(prev => ({ ...prev, [key]: value } as BlockContent))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/blocks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: block.id, content, settings }),
      })
      onSave({ ...block, content, settings })
      onClose()
    } catch (err) {
      console.error('Failed to save block', err)
      alert('Failed to save block')
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-[#0d0d14] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/10">
          <h2 className="font-syne text-2xl font-bold text-white capitalize">
            Edit {block.type} Block
          </h2>
          <button 
            onClick={onClose} 
            className="p-3 rounded-2xl hover:bg-white/10 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {renderFields(block.type, content, updateContent)}

          {/* Layout Settings */}
          <div className="border-t border-white/10 pt-8">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-4">LAYOUT SETTINGS</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/50 text-xs mb-1.5 block">Max Width</label>
                <select
                  value={settings.maxWidth || 'lg'}
                  onChange={e => setSettings(s => ({ ...s, maxWidth: e.target.value as any }))}
                  className="w-full bg-[#13131a] border border-white/10 rounded-2xl px-4 py-3 text-white"
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                  <option value="full">Full Width</option>
                </select>
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1.5 block">Alignment</label>
                <select
                  value={settings.alignment || 'left'}
                  onChange={e => setSettings(s => ({ ...s, alignment: e.target.value as any }))}
                  className="w-full bg-[#13131a] border border-white/10 rounded-2xl px-4 py-3 text-white"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grouping Controls */}
          <BlockGroupingControls
            block={{ ...block, settings }}
            onUpdate={(data) => setSettings(prev => ({ ...prev, ...data.settings }))}
          />
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
            className="flex-1 py-4 bg-[#7ef0c8] text-black font-semibold rounded-2xl hover:bg-[#5dd4aa] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ====================== RENDER FIELDS ======================
function renderFields(
  type: string,
  content: BlockContent,
  set: (key: string, value: any) => void
) {
  const inputCls = "w-full bg-[#13131a] border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#7ef0c8]/50"

  const field = (key: string, label: string, placeholder = '', inputType = 'text') => (
    <div key={key}>
      <label className="text-white/50 text-xs mb-1.5 block">{label}</label>
      <input
        type={inputType}
        value={(content as any)[key] || ''}
        onChange={e => set(key, e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  )

  const textarea = (key: string, label: string, rows = 4, placeholder = '') => (
    <div key={key}>
      <label className="text-white/50 text-xs mb-1.5 block">{label}</label>
      <textarea
        value={(content as any)[key] || ''}
        onChange={e => set(key, e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`${inputCls} resize-y`}
      />
    </div>
  )

  switch (type) {
    case 'text':
      return (
        <div>
          <label className="text-white/50 text-xs mb-1.5 block">Content</label>
          <TiptapEditor
            value={(content as any).html || ''}
            onChange={(html) => set('html', html)}
          />
        </div>
      )

    case 'image':
      return (
        <>
          {field('url', 'Image URL', 'https://...')}
          {field('caption', 'Caption (optional)')}
          {field('alt', 'Alt text')}
          {field('link', 'Link (optional)')}
        </>
      )

    case 'youtube':
      return (
        <>
          {field('url', 'YouTube URL', 'https://youtube.com/watch?v=...')}
          {field('title', 'Title (optional)')}
        </>
      )

    case 'instagram':
      return field('url', 'Instagram Post URL', 'https://www.instagram.com/p/...')

    case 'linkedin':
      return field('url', 'LinkedIn Embed URL', 'https://www.linkedin.com/embed/...')

    case 'map':
      return (
        <>
          {field('label', 'Location Label')}
          {field('address', 'Address')}
          <div className="grid grid-cols-2 gap-4">
            {field('lat', 'Latitude', '13.6288')}
            {field('lng', 'Longitude', '79.4192')}
          </div>
        </>
      )

    case 'testimonial':
      return (
        <>
          {textarea('quote', 'Quote', 4)}
          {field('name', 'Client Name')}
          {field('role', 'Role / Company')}
          {field('avatar', 'Avatar URL (optional)')}
          <div>
            <label className="text-white/50 text-xs mb-1.5 block">Rating (1-5)</label>
            <input
              type="number"
              min="1"
              max="5"
              value={(content as any).rating || 5}
              onChange={e => set('rating', Number(e.target.value))}
              className={inputCls}
            />
          </div>
        </>
      )

    case 'button':
      return (
        <>
          {field('label', 'Button Label')}
          {field('url', 'URL')}
          <div>
            <label className="text-white/50 text-xs mb-1.5 block">Style</label>
            <select
              value={(content as any).style || 'primary'}
              onChange={e => set('style', e.target.value)}
              className={inputCls}
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="outline">Outline</option>
              <option value="ghost">Ghost</option>
            </select>
          </div>
        </>
      )

    case 'blog':
      return (
        <>
          {field('title', 'Article Title')}
          {field('coverImage', 'Cover Image URL')}
          {textarea('excerpt', 'Excerpt', 2)}
          <div>
            <label className="text-white/50 text-xs mb-1.5 block">Full Content</label>
            <TiptapEditor
              value={(content as any).html || ''}
              onChange={html => set('html', html)}
            />
          </div>
        </>
      )

    case 'project':
      return (
        <>
          {field('title', 'Project Title')}
          {textarea('description', 'Description')}
          {field('thumbnail', 'Thumbnail URL')}
          {field('liveUrl', 'Live URL')}
          {field('githubUrl', 'GitHub URL')}
          {field('tags', 'Tags (comma separated)')}
        </>
      )

    case 'skills':
      const skills = (content as any).skills || []

      const addSkill = () => {
        set('skills', [...skills, { name: '', level: 80 }])
      }

      const updateSkill = (index: number, field: 'name' | 'level', value: any) => {
        const newSkills = [...skills]
        newSkills[index] = { ...newSkills[index], [field]: value }
        set('skills', newSkills)
      }

      const removeSkill = (index: number) => {
        set('skills', skills.filter((_: any, i: number) => i !== index))
      }

      return (
        <div className="space-y-6">
          {field('title', 'Section Title', 'My Skills')}

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-white/50 text-xs">Skills</label>
              <button
                onClick={addSkill}
                className="flex items-center gap-1.5 text-[#7ef0c8] hover:text-white text-sm"
              >
                <Plus size={16} /> Add Skill
              </button>
            </div>

            <div className="space-y-4">
              {skills.map((skill: any, index: number) => (
                <div key={index} className="flex gap-4 items-end bg-[#1a1a24] border border-white/10 rounded-2xl p-5">
                  <div className="flex-1">
                    <label className="text-white/50 text-xs mb-1.5 block">Skill Name</label>
                    <input
                      type="text"
                      value={skill.name || ''}
                      onChange={(e) => updateSkill(index, 'name', e.target.value)}
                      placeholder="React.js"
                      className={inputCls}
                    />
                  </div>
                  <div className="w-32">
                    <label className="text-white/50 text-xs mb-1.5 block">Proficiency (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={skill.level || 80}
                      onChange={(e) => updateSkill(index, 'level', Number(e.target.value))}
                      className={inputCls}
                    />
                  </div>
                  <button
                    onClick={() => removeSkill(index)}
                    className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}

              {skills.length === 0 && (
                <p className="text-white/40 text-center py-8 border border-dashed border-white/20 rounded-2xl">
                  No skills added yet. Click "Add Skill"
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="text-white/50 text-xs mb-1.5 block">Display Style</label>
            <select
              value={(content as any).displayStyle || 'bars'}
              onChange={e => set('displayStyle', e.target.value)}
              className="w-full bg-[#13131a] border border-white/10 rounded-2xl px-4 py-3 text-white"
            >
              <option value="bars">Progress Bars</option>
              <option value="chips">Skill Chips</option>
              <option value="grid">Card Grid</option>
            </select>
          </div>
        </div>
      )

    case 'social':
      return (
        <div className="text-white/40 p-6 border border-dashed border-white/20 rounded-2xl">
          Social Links editor coming soon. Use JSON for now if needed.
        </div>
      )

    case 'experience':
      const expItems = (content as any).items || []
      
      const addExp = () => set('items', [...expItems, { role: '', company: '', duration: '', description: '' }])
      const updateExp = (index: number, field: string, value: any) => {
        const newItems = [...expItems]
        newItems[index] = { ...newItems[index], [field]: value }
        set('items', newItems)
      }
      const removeExp = (index: number) => set('items', expItems.filter((_:any, i:number) => i !== index))

      return (
        <div className="space-y-6">
          {field('title', 'Section Title', 'My Experience')}
          
          <div className="flex justify-between items-center">
            <label className="text-white/50 text-xs">Timeline Items</label>
            <button onClick={addExp} className="text-[#7ef0c8] text-sm flex items-center gap-1"><Plus size={16}/> Add Role</button>
          </div>

          <div className="space-y-4">
            {expItems.map((item: any, i: number) => (
              <div key={i} className="bg-[#1a1a24] border border-white/10 p-5 rounded-2xl space-y-3 relative">
                <button onClick={() => removeExp(i)} className="absolute top-4 right-4 text-red-400 hover:bg-red-500/10 p-2 rounded-lg"><Trash2 size={16}/></button>
                <div className="grid grid-cols-2 gap-4 mr-10">
                  <div>
                    <label className="text-white/50 text-[10px] uppercase block mb-1">Role</label>
                    <input value={item.role} onChange={e => updateExp(i, 'role', e.target.value)} className={inputCls} placeholder="e.g. Senior Dev" />
                  </div>
                  <div>
                    <label className="text-white/50 text-[10px] uppercase block mb-1">Company</label>
                    <input value={item.company} onChange={e => updateExp(i, 'company', e.target.value)} className={inputCls} placeholder="e.g. Google" />
                  </div>
                </div>
                <div>
                  <label className="text-white/50 text-[10px] uppercase block mb-1">Duration</label>
                  <input value={item.duration} onChange={e => updateExp(i, 'duration', e.target.value)} className={inputCls} placeholder="e.g. Jan 2021 - Present" />
                </div>
                <div>
                  <label className="text-white/50 text-[10px] uppercase block mb-1">Description</label>
                  <textarea value={item.description} onChange={e => updateExp(i, 'description', e.target.value)} className={`${inputCls} resize-none`} rows={2} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )

    case 'divider':
      return (
        <>
          <div>
            <label className="text-white/50 text-xs mb-1.5 block">Style</label>
            <select
              value={(content as any).style || 'line'}
              onChange={e => set('style', e.target.value)}
              className={inputCls}
            >
              <option value="line">Line</option>
              <option value="space">Space</option>
              <option value="dots">Dots</option>
              <option value="wave">Wave</option>
            </select>
          </div>
          {field('height', 'Height (px)', '40', 'number')}
        </>
      )

    default:
      return <p className="text-white/40">No editor available for this block type yet.</p>
  }
}