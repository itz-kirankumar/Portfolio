'use client'

import { useUI as useToast } from '@/lib/store/ui'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveTheme } from './actions'
import { Theme, THEME_TOKENS, DARK_PRESET } from '@/lib/schemas/theme'
import { SaveBar } from '@/components/admin/ui'
import { LIGHT_PRESETS, DARK_PRESETS } from './ThemePresets'
import { cn } from '@/lib/utils'
import { Paintbrush, LayoutTemplate, Link as LinkIcon, Settings2, GripVertical, Check } from 'lucide-react'

// Combine presets for the Base Theme picker
const ALL_PRESETS = [
  ...LIGHT_PRESETS.map(p => ({ ...p, isDark: false })),
  ...DARK_PRESETS.filter(p => p.id !== 'custom').map(p => ({ ...p, isDark: true })),
]

// Exclude custom from the Dark Mode Theme picker map, we add it back manually if needed
const DARK_MODE_OPTIONS = DARK_PRESETS

function FormItem({ label, description, children }: { label: string, description?: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ink">{label}</label>
      {description && <p className="text-xs text-ink-soft mb-1">{description}</p>}
      {children}
    </div>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full rounded-md border border-rule px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral" />
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="w-full rounded-md border border-rule px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral min-h-[80px]" />
}

export default function ThemeEditor({ initialData }: { initialData: Theme }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [data, setData] = useState<Theme>(initialData)
  
  const [activeTab, setActiveTab] = useState<'colors' | 'meta' | 'layout' | 'sections'>('colors')
  
  const [showBaseCustom, setShowBaseCustom] = useState(
    Object.keys(data.light).length > 0 && !ALL_PRESETS.some(p => JSON.stringify(p.palette) === JSON.stringify(data.light))
  )
  const [showDarkCustom, setShowDarkCustom] = useState(
    Object.keys(data.dark).length > 0 && !DARK_MODE_OPTIONS.some(p => JSON.stringify(p.palette) === JSON.stringify(data.dark))
  )

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await saveTheme(data)
      if (res.ok === false) {
        setError(res.error + (res.issues ? '\n' + res.issues.join('\n') : ''))
      } else {
        useToast.getState().toast('Saved successfully!')
        router.refresh()
      }
    } catch (e: any) {
      setError('Error saving: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const updateMeta = (key: keyof Theme['meta'], value: string) => {
    setData(prev => ({ ...prev, meta: { ...prev.meta, [key]: value } }))
  }

  const setBasePreset = (preset: typeof ALL_PRESETS[0]) => {
    setData(prev => ({ ...prev, light: { ...preset.palette } }))
    setShowBaseCustom(preset.id === 'custom')
  }

  const setDarkPreset = (preset: typeof DARK_MODE_OPTIONS[0]) => {
    setData(prev => ({ ...prev, dark: { ...preset.palette } }))
    setShowDarkCustom(preset.id === 'custom')
  }

  const updateBaseToken = (token: string, color: string) => {
    setData(prev => ({
      ...prev,
      light: { ...prev.light, [token]: color }
    }))
  }

  const updateDarkToken = (token: string, color: string) => {
    setData(prev => ({
      ...prev,
      dark: { ...prev.dark, [token]: color }
    }))
  }

  const TABS = [
    { id: 'colors', label: 'Theme & Colors', icon: Paintbrush },
    { id: 'layout', label: 'Typography & Layout', icon: LayoutTemplate },
    { id: 'meta', label: 'Metadata & SEO', icon: LinkIcon },
    { id: 'sections', label: 'Homepage Sections', icon: GripVertical },
  ] as const

  return (
    <div className="space-y-8 pb-32">
      
      {/* Navigation Tabs */}
      <div className="flex space-x-1 border-b border-rule bg-card rounded-t-xl overflow-hidden px-4 pt-4">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                isActive 
                  ? "border-coral text-coral-ink bg-paper-deep/50 rounded-t-lg" 
                  : "border-transparent text-ink-soft hover:text-ink hover:bg-stone-50"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="bg-card border border-rule rounded-xl rounded-tl-none p-6 md:p-8 -mt-8 shadow-sm">
        
        {/* COLORS TAB */}
        {activeTab === 'colors' && (
          <div className="space-y-12">
            <section>
              <h3 className="text-lg font-display font-bold mb-1">Base Theme</h3>
              <p className="text-ink-soft text-sm mb-4">Choose a single default theme for your platform. This scales across all devices.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                {ALL_PRESETS.map(preset => (
                  <button
                    key={`${preset.id}-${preset.isDark ? 'dark' : 'light'}`}
                    onClick={() => setBasePreset(preset)}
                    className={cn(
                      "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all text-left group",
                      (!showBaseCustom && JSON.stringify(data.light) === JSON.stringify(preset.palette)) || (showBaseCustom && preset.id === 'custom')
                        ? "border-coral bg-coral/5 ring-4 ring-coral/10"
                        : "border-rule hover:border-stone-300 hover:bg-stone-50"
                    )}
                  >
                    <div 
                      className="w-full h-12 rounded-lg border border-rule/50 shadow-sm flex items-center justify-center relative overflow-hidden"
                      style={{ backgroundColor: preset.palette.paper || (preset.isDark ? '#16130f' : '#fbf7f0') }}
                    >
                      <div 
                        className="absolute inset-x-0 bottom-0 h-1/2 opacity-50"
                        style={{ backgroundColor: preset.palette['paper-deep'] || (preset.isDark ? '#0f0d0a' : '#f0eadc') }}
                      />
                      <div 
                        className="w-6 h-6 rounded-full shadow-sm z-10 border border-white/20"
                        style={{ backgroundColor: preset.palette.coral || (preset.isDark ? '#ff6b4f' : '#e8543f') }}
                      />
                    </div>
                    <span className="font-medium text-xs text-ink group-hover:text-coral-ink transition-colors text-center leading-tight">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>

              {showBaseCustom && (
                <div className="bg-paper-deep/30 rounded-xl p-6 border border-rule/50">
                  <h4 className="text-sm font-medium mb-4 flex items-center gap-2"><Settings2 className="w-4 h-4"/> Custom Palette</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {THEME_TOKENS.map(token => (
                      <div key={token} className="flex flex-col gap-1.5">
                        <label className="text-xs font-mono text-ink-soft capitalize">{token.replace('-', ' ')}</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={data.light[token] || '#000000'} 
                            onChange={(e) => updateBaseToken(token, e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                          />
                          <input 
                            type="text" 
                            value={data.light[token] || ''}
                            onChange={(e) => updateBaseToken(token, e.target.value)}
                            placeholder="Default"
                            className="flex-1 w-20 text-xs font-mono bg-white border border-rule rounded px-2 py-1.5"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <div className="h-px w-full bg-rule/50" />

            <section className="space-y-6">
              <div>
                <h3 className="text-lg font-display font-bold mb-1">Dual Theme Support (Dark Mode)</h3>
                <p className="text-ink-soft text-sm">
                  Allow your site to adapt when the user toggles dark mode or their system setting is dark.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="enable-dark"
                  checked={data.darkMode !== 'off'}
                  onChange={e => setData(prev => ({ ...prev, darkMode: e.target.checked ? 'auto' : 'off' }))}
                  className="w-5 h-5 rounded border-rule text-coral focus:ring-coral"
                />
                <label htmlFor="enable-dark" className="font-medium text-ink cursor-pointer">Enable Alternate Theme</label>
              </div>

              {data.darkMode !== 'off' && (
                <div className="pl-8 space-y-8 animate-in fade-in slide-in-from-top-2">
                  <FormItem label="Dark Mode Policy">
                    <select 
                      value={data.darkMode} 
                      onChange={e => setData(prev => ({ ...prev, darkMode: e.target.value as any }))}
                      className="w-full max-w-sm rounded-md border border-rule px-3 py-2 text-sm bg-white"
                    >
                      <option value="auto">System Preference (Auto)</option>
                      <option value="toggle">User Toggle Button</option>
                    </select>
                  </FormItem>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Alternate Theme</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {DARK_MODE_OPTIONS.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => setDarkPreset(preset)}
                          className={cn(
                            "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all text-left group",
                            (!showDarkCustom && JSON.stringify(data.dark) === JSON.stringify(preset.palette)) || (showDarkCustom && preset.id === 'custom')
                              ? "border-coral bg-coral/5 ring-4 ring-coral/10"
                              : "border-rule hover:border-stone-300 hover:bg-stone-50"
                          )}
                        >
                          <div 
                            className="w-full h-12 rounded-lg border border-rule/50 shadow-sm flex items-center justify-center relative overflow-hidden"
                            style={{ backgroundColor: preset.palette.paper || '#16130f' }}
                          >
                            <div 
                              className="absolute inset-x-0 bottom-0 h-1/2 opacity-50"
                              style={{ backgroundColor: preset.palette['paper-deep'] || '#0f0d0a' }}
                            />
                            <div 
                              className="w-6 h-6 rounded-full shadow-sm z-10 border border-white/20"
                              style={{ backgroundColor: preset.palette.coral || '#ff6b4f' }}
                            />
                          </div>
                          <span className="font-medium text-xs text-ink group-hover:text-coral-ink transition-colors leading-tight">{preset.name}</span>
                        </button>
                      ))}
                    </div>

                    {showDarkCustom && (
                      <div className="bg-paper-deep/30 rounded-xl p-6 border border-rule/50">
                        <h4 className="text-sm font-medium mb-4 flex items-center gap-2"><Settings2 className="w-4 h-4"/> Custom Alternate Palette</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {THEME_TOKENS.map(token => (
                            <div key={token} className="flex flex-col gap-1.5">
                              <label className="text-xs font-mono text-ink-soft capitalize">{token.replace('-', ' ')}</label>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="color" 
                                  value={data.dark[token] || '#000000'} 
                                  onChange={(e) => updateDarkToken(token, e.target.value)}
                                  className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                />
                                <input 
                                  type="text" 
                                  value={data.dark[token] || ''}
                                  onChange={(e) => updateDarkToken(token, e.target.value)}
                                  placeholder="Default"
                                  className="flex-1 w-20 text-xs font-mono bg-white border border-rule rounded px-2 py-1.5"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* LAYOUT TAB */}
        {activeTab === 'layout' && (
          <div className="space-y-8 max-w-2xl">
            <FormItem label="Hero Layout" description="How the homepage introduction is styled.">
              <select 
                value={data.heroLayout} 
                onChange={e => setData(prev => ({ ...prev, heroLayout: e.target.value as any }))}
                className="w-full rounded-md border border-rule px-3 py-2 text-sm bg-white"
              >
                <option value="stacked">Stacked (Text above image)</option>
                <option value="split">Split (Side by side)</option>
                <option value="portrait-left">Portrait Left (Creative)</option>
              </select>
            </FormItem>

            <div className="grid grid-cols-2 gap-8">
              <FormItem label="Border Radius" description="Shape of cards and buttons.">
                <select 
                  value={data.radius} 
                  onChange={e => setData(prev => ({ ...prev, radius: e.target.value as any }))}
                  className="w-full rounded-md border border-rule px-3 py-2 text-sm bg-white"
                >
                  <option value="sharp">Sharp</option>
                  <option value="soft">Soft (Default)</option>
                  <option value="round">Round</option>
                </select>
              </FormItem>

              <FormItem label="Type Scale" description="Scale factor for fluid typography.">
                <input 
                  type="number"
                  step="0.05"
                  min="0.85"
                  max="1.2"
                  value={data.typeScale}
                  onChange={e => setData(prev => ({ ...prev, typeScale: parseFloat(e.target.value) }))}
                  className="w-full rounded-md border border-rule px-3 py-2 text-sm bg-white"
                />
              </FormItem>
            </div>
          </div>
        )}

        {/* META TAB */}
        {activeTab === 'meta' && (
          <div className="space-y-6 max-w-2xl">
            <FormItem label="Site Name">
              <Input 
                value={data.meta.name} 
                onChange={e => updateMeta('name', e.target.value)} 
                placeholder="John Doe"
              />
            </FormItem>
            <FormItem label="Descriptor" description="A short tagline for the header.">
              <Input 
                value={data.meta.descriptor} 
                onChange={e => updateMeta('descriptor', e.target.value)} 
                placeholder="Software Engineer & Designer"
              />
            </FormItem>
            <FormItem label="Availability">
              <Input 
                value={data.meta.availability} 
                onChange={e => updateMeta('availability', e.target.value)} 
                placeholder="Available for new projects"
              />
            </FormItem>
            <FormItem label="Twitter / X Handle">
              <Input 
                value={data.meta.twitterHandle || ''} 
                onChange={e => updateMeta('twitterHandle', e.target.value)} 
                placeholder="@username"
              />
            </FormItem>
            <FormItem label="SEO Keywords">
              <Textarea 
                value={data.meta.keywords || ''} 
                onChange={e => updateMeta('keywords', e.target.value)} 
                placeholder="developer, designer, portfolio..."
              />
            </FormItem>
          </div>
        )}

        {/* SECTIONS TAB */}
        {activeTab === 'sections' && (
          <div className="max-w-2xl">
            <p className="text-ink-soft mb-6 text-sm">
              Control which sections appear on your homepage.
            </p>
            <div className="space-y-2">
              {data.sections.length === 0 ? (
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md text-sm">
                  Using default sections. Toggle one below to save a custom configuration.
                </div>
              ) : null}
              
              {['hero', 'creds', 'proof', 'audiences', 'ways', 'ventures', 'projects', 'pov', 'gallery', 'writing', 'closing'].map((key) => {
                const existing = data.sections.find(s => s.key === key)
                const isVisible = existing ? existing.visible : true
                
                return (
                  <div key={key} className="flex items-center justify-between p-3 border border-rule rounded-lg bg-white">
                    <span className="font-mono text-sm">{key}</span>
                    <button
                      onClick={() => {
                        let newSections = [...data.sections]
                        if (!existing) {
                          newSections.push({ key, visible: false })
                        } else {
                          newSections = newSections.map(s => s.key === key ? { ...s, visible: !s.visible } : s)
                        }
                        setData(prev => ({ ...prev, sections: newSections }))
                      }}
                      className={cn(
                        "px-3 py-1 text-xs rounded-full font-medium transition-colors",
                        isVisible ? "bg-green-100 text-green-800" : "bg-stone-100 text-stone-500"
                      )}
                    >
                      {isVisible ? 'Visible' : 'Hidden'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <SaveBar 
        onSave={handleSave} 
        saving={loading} 
        error={error} 
        dirty={JSON.stringify(data) !== JSON.stringify(initialData)} 
        onReset={() => {
          setData(initialData)
          setShowBaseCustom(Object.keys(initialData.light).length > 0 && !ALL_PRESETS.some(p => JSON.stringify(p.palette) === JSON.stringify(initialData.light)))
          setShowDarkCustom(Object.keys(initialData.dark).length > 0 && !DARK_MODE_OPTIONS.some(p => JSON.stringify(p.palette) === JSON.stringify(initialData.dark)))
        }} 
      />
    </div>
  )
}