'use client'
// components/dashboard/ThemeEditor.tsx
import { useState } from 'react'
import { Save, Palette, Type, Layout, Code, Layers } from 'lucide-react'
import type { PortfolioTheme } from '@/types'

const BACKDROP_OPTIONS = [
  { id: 'zen-minimal',    name: 'Zen Minimal' },
  { id: 'animated-grid',  name: 'Perspective Grid' },
  { id: 'aurora',         name: 'Aurora Borealis' },
  { id: 'starfield',      name: 'Starfield Parallax' },
  { id: 'hexagons',       name: 'Hexagon Mesh' },
  { id: 'minimal-dots',   name: 'Minimal Dots' },
  { id: 'topographic',    name: 'Topographic' },
  { id: 'cyber-circuit',  name: 'Cyber Circuit' },
  { id: 'retro-wave',     name: 'Retro Wave' },
  { id: 'matrix-rain',    name: 'Matrix Rain' },
  { id: 'sonar-pulse',    name: 'Sonar Pulse' },
  { id: 'floating-glass', name: 'Floating Glass' },
  { id: 'quantum-foam',   name: 'Quantum Foam' },
  { id: 'laser-scan',     name: 'Laser Scan' },
  { id: 'dna-helix',      name: 'DNA Helix' },
  { id: 'binary-static',  name: 'Binary Static' },
  { id: 'fluid-waves',    name: 'Fluid Waves' },
  { id: 'glass-orbs',     name: 'Glass Orbs' },
  { id: 'architectural',  name: 'Architectural' },
  { id: 'cosmic-dust',    name: 'Cosmic Dust' },
  { id: 'glitch-noise',   name: 'Glitch Noise' },
]

interface Props {
  currentTheme: PortfolioTheme
  onUpdate: (updated: PortfolioTheme) => void
}

export default function ThemeEditor({ currentTheme, onUpdate }: Props) {
  const [theme, setTheme] = useState<PortfolioTheme>(currentTheme)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme }),
    })
    onUpdate(theme)
    setSaving(false)
  }

  const inputCls = "w-full bg-[#13131a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#7ef0c8]/40 transition-all"

  return (
    <div className="space-y-6 max-w-4xl pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-syne text-white flex items-center gap-2">
          <Palette size={18} className="text-[#7ef0c8]" /> Appearance
        </h2>
        <button 
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-[#7ef0c8] text-[#0a0a0f] px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-[#5dd4aa] transition-colors"
        >
          <Save size={15} /> {saving ? 'Saving...' : 'Save Theme'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Colors */}
        <div className="p-6 bg-[#13131a] border border-white/5 rounded-3xl space-y-4">
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest flex items-center gap-2"><Palette size={14}/> Brand Colors</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Primary Accent</label>
              <div className="flex gap-3">
                <input type="color" value={theme.primaryColor || '#7ef0c8'} onChange={e => setTheme({...theme, primaryColor: e.target.value})} className="w-12 h-10 rounded-lg bg-transparent border border-white/10 cursor-pointer" />
                <input value={theme.primaryColor || '#7ef0c8'} onChange={e => setTheme({...theme, primaryColor: e.target.value})} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Background</label>
              <div className="flex gap-3">
                <input type="color" value={theme.bgColor || '#030305'} onChange={e => setTheme({...theme, bgColor: e.target.value})} className="w-12 h-10 rounded-lg bg-transparent border border-white/10 cursor-pointer" />
                <input value={theme.bgColor || '#030305'} onChange={e => setTheme({...theme, bgColor: e.target.value})} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Text Color</label>
              <div className="flex gap-3">
                <input type="color" value={theme.textColor || '#ffffff'} onChange={e => setTheme({...theme, textColor: e.target.value})} className="w-12 h-10 rounded-lg bg-transparent border border-white/10 cursor-pointer" />
                <input value={theme.textColor || '#ffffff'} onChange={e => setTheme({...theme, textColor: e.target.value})} className={inputCls} />
              </div>
            </div>
          </div>
        </div>

        {/* Typography & Shape */}
        <div className="p-6 bg-[#13131a] border border-white/5 rounded-3xl space-y-6">
          <div>
            <p className="text-xs font-bold text-white/30 uppercase tracking-widest flex items-center gap-2 mb-4"><Type size={14}/> Typography</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Heading Font (Google Font)</label>
                <input value={theme.headingFont || 'Syne'} onChange={e => setTheme({...theme, headingFont: e.target.value})} placeholder="e.g. Syne, Inter, Montserrat" className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Body Font</label>
                <input value={theme.bodyFont || 'DM Sans'} onChange={e => setTheme({...theme, bodyFont: e.target.value})} placeholder="e.g. DM Sans, Roboto" className={inputCls} />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-xs font-bold text-white/30 uppercase tracking-widest flex items-center gap-2 mb-4"><Layout size={14}/> Border Radius</p>
            <div className="flex gap-2">
              {(['none', 'sm', 'md', 'lg', 'full'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setTheme({...theme, borderRadius: r})}
                  className={`flex-1 py-2 text-sm transition-all border rounded-xl ${
                    theme.borderRadius === r ? 'border-[#7ef0c8]/50 text-[#7ef0c8] bg-[#7ef0c8]/10' : 'border-white/[0.07] text-white/40 hover:border-white/20'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 21+ Global Backdrops */}
        <div className="md:col-span-2 p-6 bg-[#13131a] border border-white/5 rounded-3xl space-y-4">
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest flex items-center gap-2"><Layers size={14}/> 3D Global Backdrop</p>
          <p className="text-white/40 text-sm mb-4">Choose a dynamic, scroll-reactive environment for your portfolio background.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {BACKDROP_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setTheme({...theme, backdropStyle: opt.id})}
                className={`p-3 text-left border rounded-xl transition-all h-20 flex items-end ${
                  theme.backdropStyle === opt.id 
                  ? 'border-[#7ef0c8] bg-[#7ef0c8]/10 shadow-[0_0_15px_rgba(126,240,200,0.1)]' 
                  : 'border-white/[0.05] hover:border-white/20 hover:bg-white/[0.02]'
                }`}
              >
                <span className={`text-xs font-medium leading-tight ${theme.backdropStyle === opt.id ? 'text-[#7ef0c8]' : 'text-white/60'}`}>
                  {opt.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Custom CSS */}
        <div className="md:col-span-2 p-6 bg-[#13131a] border border-white/5 rounded-3xl space-y-4">
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest flex items-center gap-2"><Code size={14}/> Advanced Custom CSS</p>
          <p className="text-white/40 text-sm">Inject your own global CSS rules directly into the portfolio layout.</p>
          <textarea
            value={theme.customCSS || ''}
            onChange={e => setTheme({...theme, customCSS: e.target.value})}
            rows={5}
            placeholder="/* e.g., body { overflow-x: hidden; } */"
            className="w-full bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#7ef0c8]/40 resize-y"
          />
        </div>
        
      </div>
    </div>
  )
}