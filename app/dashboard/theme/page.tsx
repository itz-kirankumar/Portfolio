'use client'
// app/dashboard/theme/page.tsx
import { useState, useEffect } from 'react'
import { Save, Palette, Type, Layout, Layers, Code } from 'lucide-react'
import type { PortfolioTheme } from '@/types'

const PRESETS: { name: string; theme: Partial<PortfolioTheme> }[] = [
  { name: 'Dark Mint',    theme: { bgColor: '#0a0a0f', primaryColor: '#7ef0c8', accentColor: '#818cf8', textColor: '#e8e6e0', surfaceColor: '#13131a' } },
  { name: 'Pure Dark',    theme: { bgColor: '#000000', primaryColor: '#ffffff', accentColor: '#ff6b6b', textColor: '#ffffff', surfaceColor: '#111111' } },
  { name: 'Warm Light',   theme: { bgColor: '#fafaf8', primaryColor: '#1a1a1a', accentColor: '#f97316', textColor: '#1a1a1a', surfaceColor: '#f0efe9' } },
  { name: 'Purple Haze',  theme: { bgColor: '#0f0a1e', primaryColor: '#c084fc', accentColor: '#f472b6', textColor: '#e9d5ff', surfaceColor: '#1a1030' } },
  { name: 'Ocean Blue',   theme: { bgColor: '#020f1e', primaryColor: '#38bdf8', accentColor: '#34d399', textColor: '#e0f2fe', surfaceColor: '#041624' } },
]

const FONTS = ['Syne', 'Inter', 'Space Grotesk', 'Playfair Display', 'DM Sans', 'Raleway', 'Poppins', 'Oswald']

const BACKDROP_OPTIONS = [
  { id: 'zen-minimal',      name: 'Zen Minimal' },
  { id: 'perspective-grid', name: 'Perspective Grid' },
  { id: 'aurora',           name: 'Aurora Borealis' },
  { id: 'starfield',        name: 'Starfield Parallax' },
  { id: 'hyperspace',       name: 'Hyperspace' },
  { id: 'neon-tunnel',      name: 'Neon Tunnel' },
  { id: 'hexagons',         name: 'Hexagon Mesh' },
  { id: 'cyber-circuit',    name: 'Cyber Circuit' },
  { id: 'retro-wave',       name: 'Retro Wave' },
  { id: 'matrix-rain',      name: 'Matrix Rain' },
  { id: 'dark-matter',      name: 'Dark Matter' },
  { id: 'sonar-pulse',      name: 'Sonar Pulse' },
  { id: 'floating-glass',   name: 'Floating Glass' },
  { id: 'quantum-foam',     name: 'Quantum Foam' },
  { id: 'polygonal',        name: 'Polygonal 3D' },
  { id: 'laser-scan',       name: 'Laser Scan' },
  { id: 'dna-helix',        name: 'DNA Helix' },
  { id: 'binary-static',    name: 'Binary Static' },
  { id: 'fluid-waves',      name: 'Fluid Waves' },
  { id: 'glass-orbs',       name: 'Glass Orbs' },
  { id: 'architectural',    name: 'Architectural' },
  { id: 'cosmic-dust',      name: 'Cosmic Dust' },
  { id: 'minimal-dots',     name: 'Minimal Dots' },
  { id: 'topographic',      name: 'Topographic' },
  { id: 'holographic',      name: 'Holographic' },
  { id: 'glitch-noise',     name: 'Glitch Noise' },
]

const DEFAULT_THEME: PortfolioTheme = {
  preset: 'Dark Mint',
  primaryColor: '#7ef0c8',
  accentColor: '#818cf8',
  bgColor: '#0a0a0f',
  surfaceColor: '#13131a',
  textColor: '#e8e6e0',
  headingFont: 'Syne',
  bodyFont: 'DM Sans',
  borderRadius: 'lg',
  darkMode: true,
  backdropStyle: 'perspective-grid', // Default fallback
}

export default function ThemePage() {
  const [theme, setTheme] = useState<PortfolioTheme>(DEFAULT_THEME)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => { if (d.profile?.theme) setTheme(d.profile.theme) })
  }, [])

  const set = (key: keyof PortfolioTheme, value: unknown) =>
    setTheme(t => ({ ...t, [key]: value }))

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setTheme(t => ({ ...t, ...preset.theme, preset: preset.name }))
  }

  const save = async () => {
    setSaving(true)
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const label = (text: string) => (
    <label className="text-white/50 text-xs mb-1.5 block">{text}</label>
  )

  const colorInput = (key: keyof PortfolioTheme, labelText: string) => (
    <div>
      {label(labelText)}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={theme[key] as string || '#000000'}
          onChange={e => set(key, e.target.value)}
          className="w-9 h-9 rounded-lg cursor-pointer border border-white/10 bg-transparent"
        />
        <input
          type="text"
          value={theme[key] as string || ''}
          onChange={e => set(key, e.target.value)}
          className="flex-1 bg-[#13131a] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#7ef0c8]/40"
        />
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-syne text-3xl font-bold text-white mb-1">Theme & Appearance</h1>
          <p className="text-white/40 text-sm">Customise every visual aspect and 3D environment of your portfolio</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-[#7ef0c8] text-[#0a0a0f] font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#5dd4aa] transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Theme'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Presets */}
        <div className="bg-[#13131a] border border-white/[0.07] rounded-3xl p-6">
          <h2 className="text-white font-syne font-semibold mb-4">Quick Presets</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {PRESETS.map(p => (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  theme.preset === p.name ? 'border-[#7ef0c8] ring-2 ring-[#7ef0c8]/20 scale-[1.02]' : 'border-white/[0.07] hover:border-white/20'
                }`}
                style={{ backgroundColor: p.theme.bgColor }}
              >
                <div className="w-5 h-5 rounded-full mb-3" style={{ backgroundColor: p.theme.primaryColor }} />
                <p className="text-[11px] font-bold" style={{ color: p.theme.textColor, opacity: 0.8 }}>{p.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 25+ Global Backdrops */}
        <div className="bg-[#13131a] border border-white/[0.07] rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Layers size={16} className="text-[#7ef0c8]" />
            <h2 className="text-white font-syne font-semibold">3D Global Backdrop</h2>
          </div>
          <p className="text-white/40 text-xs mb-5">Choose an infinitely scrolling, hardware-accelerated 3D environment.</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {BACKDROP_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => set('backdropStyle', opt.id)}
                className={`p-3 text-left border rounded-xl transition-all h-24 flex flex-col justify-end ${
                  theme.backdropStyle === opt.id 
                  ? 'border-[#7ef0c8] bg-[#7ef0c8]/10 shadow-[0_0_20px_rgba(126,240,200,0.15)] scale-[1.02]' 
                  : 'border-white/[0.05] hover:border-white/20 hover:bg-white/[0.02]'
                }`}
              >
                <span className={`text-[11px] font-bold leading-tight ${theme.backdropStyle === opt.id ? 'text-[#7ef0c8]' : 'text-white/60'}`}>
                  {opt.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Colors */}
          <div className="bg-[#13131a] border border-white/[0.07] rounded-3xl p-6">
            <h2 className="text-white font-syne font-semibold mb-5 flex items-center gap-2"><Palette size={16} className="text-[#7ef0c8]"/> Colors</h2>
            <div className="space-y-4">
              {colorInput('bgColor',       'Background')}
              {colorInput('surfaceColor',  'Surface / Cards')}
              {colorInput('primaryColor',  'Primary / Accent')}
              {colorInput('accentColor',   'Secondary Accent')}
              {colorInput('textColor',     'Text Color')}
            </div>
          </div>

          <div className="space-y-6">
            {/* Typography */}
            <div className="bg-[#13131a] border border-white/[0.07] rounded-3xl p-6">
              <h2 className="text-white font-syne font-semibold mb-5 flex items-center gap-2"><Type size={16} className="text-[#7ef0c8]"/> Typography</h2>
              <div className="space-y-4">
                <div>
                  {label('Heading Font (Google Font)')}
                  <select value={theme.headingFont} onChange={e => set('headingFont', e.target.value)} className="w-full bg-[#0d0d14] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#7ef0c8]/40">
                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  {label('Body Font')}
                  <select value={theme.bodyFont} onChange={e => set('bodyFont', e.target.value)} className="w-full bg-[#0d0d14] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#7ef0c8]/40">
                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Border radius */}
            <div className="bg-[#13131a] border border-white/[0.07] rounded-3xl p-6">
              <h2 className="text-white font-syne font-semibold mb-4 flex items-center gap-2"><Layout size={16} className="text-[#7ef0c8]"/> Border Radius</h2>
              <div className="flex gap-2 flex-wrap">
                {(['none', 'sm', 'md', 'lg', 'full'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => set('borderRadius', r)}
                    className={`flex-1 min-w-[60px] py-2.5 text-sm font-medium transition-all border ${
                      theme.borderRadius === r ? 'border-[#7ef0c8]/50 text-[#7ef0c8] bg-[#7ef0c8]/10' : 'border-white/[0.07] text-white/40 hover:border-white/20'
                    }`}
                    style={{ borderRadius: r === 'none' ? 0 : r === 'sm' ? 4 : r === 'md' ? 8 : r === 'lg' ? 16 : 999 }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Custom CSS */}
        <div className="bg-[#13131a] border border-white/[0.07] rounded-3xl p-6">
          <h2 className="text-white font-syne font-semibold mb-1 flex items-center gap-2"><Code size={16} className="text-[#7ef0c8]"/> Custom CSS</h2>
          <p className="text-white/40 text-xs mb-5">Advanced: inject your own CSS directly into the entire portfolio layout.</p>
          <textarea
            value={theme.customCSS || ''}
            onChange={e => set('customCSS', e.target.value)}
            rows={5}
            placeholder="/* e.g., p { text-align: justify; } */"
            className="w-full bg-[#0d0d14] border border-white/[0.08] rounded-xl px-4 py-4 text-white/70 text-sm font-mono focus:outline-none focus:border-[#7ef0c8]/40 resize-y"
          />
        </div>
      </div>
    </div>
  )
}