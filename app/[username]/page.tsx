// app/[username]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getProfileByUsername, getBlocks } from '@/lib/firestore'

import BlockRenderer from '@/components/blocks/BlockRenderer'
import NavBar from '@/components/portfolio/NavBar'
import HeroSection from '@/components/portfolio/HeroSection'
import GlobalBackdrop from '@/components/portfolio/GlobalBackdrop'
import SectionWrapper from '@/components/portfolio/SectionWrapper'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const profile = await getProfileByUsername(username)
  if (!profile) return { title: 'Not Found' }

  return {
    title: `${profile.displayName} — Portfolio`,
    description: profile.bio || '',
  }
}

export default async function PortfolioPage({ params }: Props) {
  const { username } = await params
  const profile = await getProfileByUsername(username)
  if (!profile) notFound()

  // CTO THEME EXTRACTION
  const theme = profile.theme;
  const globalBg = theme?.bgColor || '#030305'
  const globalText = theme?.textColor || '#ffffff'
  const primaryColor = theme?.primaryColor || '#7ef0c8'
  const headingFont = theme?.headingFont || 'Syne'
  const bodyFont = theme?.bodyFont || 'DM Sans'
  const customCSS = theme?.customCSS || ''

  if (!profile.isPublic) {
    const session = await getServerSession(authOptions)
    if (session?.user?.id !== profile.uid) {
      return (
        <div 
          className="min-h-screen flex items-center justify-center text-2xl font-bold"
          style={{ 
            backgroundColor: globalBg, 
            color: `${globalText}80`,
            fontFamily: `"${headingFont}", sans-serif`
          }}
        >
          Portfolio is currently private.
        </div>
      )
    }
  }

  const blocks = await getBlocks(profile.uid)
  const visibleBlocks = blocks.filter(b => b.visible).sort((a, b) => a.order - b.order)

  const processed: any[] = []
  let i = 0

  while (i < visibleBlocks.length) {
    const block = visibleBlocks[i]
    const settings = block.settings || {}

    if (settings.sectionTitle) {
      processed.push({ type: 'section-header', ...settings })
    }

    const groupTypes = ['project', 'service', 'blog']
    if (groupTypes.includes(block.type) && !settings.displayMode) {
      const group = [block]
      i++
      while (i < visibleBlocks.length && 
             groupTypes.includes(visibleBlocks[i].type) && 
             visibleBlocks[i].settings?.groupWithPrevious !== false) {
        group.push(visibleBlocks[i])
        i++
      }
      processed.push({ type: 'group', mode: 'grid-2', items: group })
      continue
    }

    processed.push(block)
    i++
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden antialiased"
      style={{ 
        // FIX: backgroundColor is completely removed here so the GlobalBackdrop can shine through universally
        color: globalText,
        '--font-syne': `"${headingFont}", sans-serif`,
        fontFamily: `"${bodyFont}", sans-serif`
      } as React.CSSProperties}
    >
      {customCSS && <style dangerouslySetInnerHTML={{ __html: customCSS }} />}

      {/* Global 3D Engine injected with theme data */}
      <GlobalBackdrop theme={theme} />
      
      <NavBar profile={profile} />

      {/* Main Content */}
      <main className="relative z-10 flex flex-col">
        <HeroSection profile={profile} />

        {/* FIX: The "h-32 -mt-32 linear-gradient" div that was fading out the hero 
          and hiding the backdrop has been completely eradicated.
        */}

        <SectionWrapper className="space-y-32 py-24 relative z-30">
          {processed.map((item, idx) => {
            if (item.type === 'section-header') {
              return (
                <div 
                  key={`head-${idx}`} 
                  className="mb-12 border-l-2 pl-6" 
                  style={{ borderColor: `${primaryColor}50` }}
                >
                  <h2 
                    className="text-4xl sm:text-5xl font-black tracking-tight" 
                    style={{ fontFamily: `"${headingFont}", sans-serif`, color: globalText }}
                  >
                    {item.sectionTitle}
                  </h2>
                  {item.sectionDescription && (
                    <p 
                      className="mt-4 text-lg max-w-2xl font-light leading-relaxed opacity-60" 
                      style={{ color: globalText }}
                    >
                      {item.sectionDescription}
                    </p>
                  )}
                </div>
              )
            }

            if (item.type === 'group') {
              return (
                <div key={`group-${idx}`} className="grid md:grid-cols-2 gap-8">
                  {item.items.map((b: any) => (
                    <BlockRenderer
                      key={b.id}
                      block={b}
                      ownerName={profile.displayName}
                      ownerEmail={profile.email}
                    />
                  ))}
                </div>
              )
            }

            return (
              <BlockRenderer
                key={item.id}
                block={item}
                ownerName={profile.displayName}
                ownerEmail={profile.email}
                username={username}
              />
            )
          })}
        </SectionWrapper>
      </main>
      
      {/* Footer: Glassmorphic to show backdrop behind it */}
      <footer 
        className="border-t mt-20 relative z-20 backdrop-blur-lg"
        style={{ borderColor: `${globalText}15`, backgroundColor: `${globalBg}D9` }} // D9 = 85% opacity
      >
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between text-sm opacity-40">
          <p>© {new Date().getFullYear()} {profile.displayName}. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a href="#top" className="hover:opacity-100 transition-opacity">Back to top ↑</a>
          </div>
        </div>
      </footer>
    </div>
  )
}