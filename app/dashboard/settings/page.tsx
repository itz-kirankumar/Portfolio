'use client'
// app/dashboard/settings/page.tsx
import { useState, useEffect } from 'react'
import { Save, User, Globe, Search, CheckCircle, XCircle, Upload, Link as LinkIcon, Navigation, Plus, Trash2 } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { useUpload } from '@/hooks/useUpload'

export default function SettingsPage() {
  const { profile, loading } = useProfile()
  const { upload, uploading } = useUpload()
  
  const [form, setForm] = useState({
    displayName:   '',
    username:      '',
    bio:           '',
    location:      '',
    website:       '',
    heroTagline:   '',
    avatar:        '',
    navBrandName:  '',
    navLinks:      [{ label: 'Work', href: '#work' }, { label: 'Essays', href: '#blog' }],
    // Dynamic Hero Buttons
    heroPrimaryLabel:   'View My Work',
    heroPrimaryUrl:     '#work',
    heroSecondaryLabel: 'Get in Touch',
    heroSecondaryUrl:   '#contact',
    seo: { title: '', description: '', keywords: '' },
  })
  
  const [saving, setSaving]         = useState(false)
  const [saved,  setSaved]          = useState(false)
  const [usernameOk, setUsernameOk] = useState<boolean | null>(null)
  const [checking,  setChecking]    = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        displayName:   profile.displayName || '',
        username:      profile.username    || '',
        bio:           profile.bio         || '',
        location:      profile.location    || '',
        website:       profile.website     || '',
        heroTagline:   profile.heroTagline || '',
        avatar:        profile.avatar      || '',
        navBrandName:  profile.navBrandName || profile.displayName?.split(' ')[0] || 'Brand',
        navLinks:      profile.navLinks?.length ? profile.navLinks : [{ label: 'Work', href: '#work' }, { label: 'Essays', href: '#blog' }],
        heroPrimaryLabel:   profile.heroPrimaryLabel || profile.hireMeLabel || 'View My Work',
        heroPrimaryUrl:     profile.heroPrimaryUrl || profile.hireMeUrl || '#work',
        heroSecondaryLabel: profile.heroSecondaryLabel || 'Get in Touch',
        heroSecondaryUrl:   profile.heroSecondaryUrl || profile.getInTouchUrl || '#contact',
        seo: {
          title:       profile.seo?.title       || '',
          description: profile.seo?.description || '',
          keywords:    profile.seo?.keywords?.join(', ') || '',
        },
      })
    }
  }, [profile])

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }))
  const setSeo = (key: string, value: string) => setForm(f => ({ ...f, seo: { ...f.seo, [key]: value } }))

  const addNavLink = () => setForm(f => ({ ...f, navLinks: [...f.navLinks, { label: '', href: '' }] }))
  const removeNavLink = (index: number) => setForm(f => ({ ...f, navLinks: f.navLinks.filter((_, i) => i !== index) }))
  const updateNavLink = (index: number, field: 'label' | 'href', value: string) => {
    const newLinks = [...form.navLinks]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setForm(f => ({ ...f, navLinks: newLinks }))
  }

  useEffect(() => {
    if (!form.username || form.username === profile?.username) { setUsernameOk(null); return }
    const timer = setTimeout(async () => {
      setChecking(true)
      try {
        const res = await fetch(`/api/profile/check-username?username=${form.username}`)
        const { available } = await res.json()
        setUsernameOk(available)
      } catch (e) {
        setUsernameOk(null)
      }
      setChecking(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [form.username, profile?.username])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await upload(file, 'avatars')
    if (url) setForm(f => ({ ...f, avatar: url }))
  }

  const save = async () => {
    setSaving(true)
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        seo: {
          ...form.seo,
          keywords: form.seo.keywords.split(',').map(k => k.trim()).filter(Boolean),
        },
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const togglePublic = async () => {
    const newState = !profile?.isPublic;
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic: newState })
    });
    window.location.reload();
  };

  if (loading || !profile) return <div className="text-white/40 pt-10">Loading settings...</div>

  const inputClass = 'w-full bg-[#13131a] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#7ef0c8]/40 transition-colors'
  const labelField = (text: string, hint?: string) => (
    <div className="mb-1.5 flex items-baseline">
      <label className="text-white/60 text-xs font-medium">{text}</label>
      {hint && <span className="text-white/25 text-xs ml-2">{hint}</span>}
    </div>
  )

  return (
    <div className="max-w-3xl pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-syne text-3xl font-bold text-white mb-1">Portfolio Settings</h1>
          <p className="text-white/40 text-sm">Manage your profile, visibility, links, and SEO</p>
        </div>
        <button
          onClick={save}
          disabled={saving || uploading}
          className="flex items-center gap-2 bg-[#7ef0c8] text-[#0a0a0f] font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-[#5dd4aa] transition-colors disabled:opacity-50"
        >
          <Save size={15} /> {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Visibility Toggle */}
        <div className="flex items-center justify-between p-6 bg-[#13131a] rounded-2xl border border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Globe size={15} className="text-[#7ef0c8]" />
              <p className="text-white font-medium">Public Visibility</p>
            </div>
            <p className="text-white/40 text-xs">Allow anyone to view your portfolio without logging in.</p>
          </div>
          <button 
            onClick={togglePublic}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${profile?.isPublic ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' : 'bg-[#7ef0c8] text-[#0a0a0f] hover:bg-[#5dd4aa]'}`}
          >
            {profile?.isPublic ? 'Make Private' : 'Go Public'}
          </button>
        </div>

        {/* Profile Identity */}
        <div className="bg-[#13131a] border border-white/[0.07] rounded-2xl p-6 space-y-6">
           <div className="flex items-center gap-2 mb-2">
            <User size={15} className="text-[#7ef0c8]" />
            <h2 className="font-syne font-semibold text-white">Profile Identity</h2>
          </div>
          <div>
            {labelField('Profile Photo')}
            <div className="flex items-center gap-6 mt-1">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                {form.avatar ? (
                  <img src={form.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#7ef0c8] to-[#818cf8] flex items-center justify-center text-3xl font-bold text-black">
                    {form.displayName?.[0] || '?'}
                  </div>
                )}
              </div>
              <label className="cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10 px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 text-white/80">
                <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload New Photo'}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {labelField('Display Name')}
              <input value={form.displayName} onChange={e => set('displayName', e.target.value)} className={inputClass} />
            </div>
            <div>
              {labelField('Username', '— your public portfolio URL')}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 text-sm">yoursite.com/</span>
                <input value={form.username} onChange={e => set('username', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))} className={`${inputClass} pl-[110px] pr-9`} />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checking && <div className="w-4 h-4 border-2 border-[#7ef0c8] border-t-transparent rounded-full animate-spin" />}
                  {!checking && usernameOk === true  && <CheckCircle size={16} className="text-[#7ef0c8]" />}
                  {!checking && usernameOk === false && <XCircle    size={16} className="text-red-400"   />}
                </div>
              </div>
            </div>
          </div>
          <div>
            {labelField('Hero Headline')}
            <input value={form.displayName} onChange={e => set('displayName', e.target.value)} className={inputClass} placeholder="Kiran Kumar G" />
          </div>
          <div>
            {labelField('Hero Tagline')}
            <input value={form.heroTagline} onChange={e => set('heroTagline', e.target.value)} className={inputClass} placeholder="Building Exceptional Tools" />
          </div>
          <div>
            {labelField('Bio / Small Text')}
            <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="A Vibe Coder" />
          </div>
        </div>

        {/* Navigation Editor */}
        <div className="bg-[#13131a] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Navigation size={15} className="text-[#7ef0c8]" />
            <h2 className="font-syne font-semibold text-white">Navigation Bar</h2>
          </div>
          
          <div className="mb-6">
            {labelField('Navbar Brand Name', '— Appears on the top left of the screen')}
            <input value={form.navBrandName} onChange={e => set('navBrandName', e.target.value)} placeholder="Your Brand" className={inputClass} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              {labelField('Navigation Links')}
              <button onClick={addNavLink} className="text-[#7ef0c8] text-xs font-medium flex items-center gap-1 hover:text-white transition-colors">
                <Plus size={14} /> Add Link
              </button>
            </div>
            
            {form.navLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/[0.02] p-2 rounded-xl border border-white/5">
                <input 
                  value={link.label} 
                  onChange={e => updateNavLink(i, 'label', e.target.value)} 
                  placeholder="Label (e.g. Work)" 
                  className="flex-1 bg-transparent border-none text-sm text-white px-3 focus:outline-none placeholder:text-white/20" 
                />
                <div className="w-px h-6 bg-white/10" />
                <input 
                  value={link.href} 
                  onChange={e => updateNavLink(i, 'href', e.target.value)} 
                  placeholder="URL (e.g. #work)" 
                  className="flex-1 bg-transparent border-none text-sm text-white px-3 focus:outline-none placeholder:text-white/20" 
                />
                <button onClick={() => removeNavLink(i)} className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Hero Buttons Editor */}
        <div className="bg-[#13131a] border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <LinkIcon size={15} className="text-[#7ef0c8]" />
            <h2 className="font-syne font-semibold text-white">Hero Action Buttons</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Button */}
            <div className="space-y-4 p-4 border border-white/5 bg-white/[0.02] rounded-xl">
              <h3 className="text-sm font-semibold text-white/80 border-b border-white/10 pb-2">Primary Action (Filled)</h3>
              <div>
                {labelField('Button Label')}
                <input value={form.heroPrimaryLabel} onChange={e => set('heroPrimaryLabel', e.target.value)} placeholder="e.g. View My Work" className={inputClass} />
              </div>
              <div>
                {labelField('Button URL / Anchor Link')}
                <input value={form.heroPrimaryUrl} onChange={e => set('heroPrimaryUrl', e.target.value)} placeholder="e.g. #work or https://..." className={inputClass} />
              </div>
            </div>

            {/* Secondary Button */}
            <div className="space-y-4 p-4 border border-white/5 bg-white/[0.02] rounded-xl">
              <h3 className="text-sm font-semibold text-white/80 border-b border-white/10 pb-2">Secondary Action (Outline)</h3>
              <div>
                {labelField('Button Label')}
                <input value={form.heroSecondaryLabel} onChange={e => set('heroSecondaryLabel', e.target.value)} placeholder="e.g. Get in Touch" className={inputClass} />
              </div>
              <div>
                {labelField('Button URL / Anchor Link')}
                <input value={form.heroSecondaryUrl} onChange={e => set('heroSecondaryUrl', e.target.value)} placeholder="e.g. #contact or /resume.pdf" className={inputClass} />
              </div>
            </div>
          </div>
          <p className="text-white/30 text-xs mt-4">Hint: To jump/scroll down to a specific section on your site, use an anchor like `#work` or `#blog`.</p>
        </div>

        {/* Danger zone */}
        <div className="bg-red-500/[0.04] border border-red-500/20 rounded-2xl p-6 mt-8">
          <h2 className="font-syne font-semibold text-red-400 mb-2">Danger Zone</h2>
          <p className="text-white/40 text-sm mb-4">Permanently delete your portfolio and all data. This cannot be undone.</p>
          <button className="text-sm text-red-400 border border-red-500/30 px-4 py-2 rounded-xl hover:bg-red-500/10 transition-colors font-medium">
            Delete Account
          </button>
        </div>

      </div>
    </div>
  )
}