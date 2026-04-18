'use client'
// components/blocks/BlockRenderer.tsx
import type { Block, PortfolioTheme } from '@/types'
import TextBlock from './TextBlock'
import ImageBlock from './ImageBlock'
import YouTubeBlock from './YouTubeBlock'
import InstagramBlock from './InstagramBlock'
import LinkedInBlock from './LinkedInBlock'
import MapBlock from './MapBlock'
import PDFBlock from './PDFBlock'
import TestimonialBlock from './TestimonialBlock'
import ServiceBlock from './ServiceBlock'
import ButtonBlock from './ButtonBlock'
import BlogBlock from './BlogBlock'
import SkillsBlock from './SkillsBlock'
import ProjectBlock from './ProjectBlock'
import SocialBlock from './SocialBlock'
import DividerBlock from './DividerBlock'
import ExperienceBlock from './ExperienceBlock' // NEW
import AnimationWrapper from './AnimationWrapper'
import ContactBlock from './ContactBlock'

const MAX_WIDTH: Record<string, string> = { sm: 'max-w-xl', md: 'max-w-3xl', lg: 'max-w-5xl', full: 'max-w-none' }
const ALIGN: Record<string, string> = { left: 'items-start text-left', center: 'items-center text-center', right: 'items-end text-right' }

interface Props {
  block: any // Accepts single Block OR a Group object
  ownerName?: string
  ownerEmail?: string
  username?: string
  theme?: PortfolioTheme
}

export default function BlockRenderer({ block, ownerName = '', ownerEmail = '', username, theme }: Props) {
  // --------------------------------------------------
  // 1. HANDLE GROUP CLUSTERS (CAROUSEL / MARQUEE)
  // --------------------------------------------------
  if (block.type === 'group') {
    const items = block.items as Block[]

    if (block.mode === 'marquee') {
      return (
        <div className="w-full relative overflow-hidden py-10 group">
          {/* Inject dynamic keyframes for seamless infinite scroll */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
            .animate-marquee { animation: marquee 30s linear infinite; }
            .group:hover .animate-marquee { animation-play-state: paused; }
          `}} />
          <div className="flex w-max animate-marquee">
            {/* Render twice for seamless infinite loop */}
            {[...items, ...items].map((b, i) => (
              <div key={`${b.id}-${i}`} className="w-[350px] md:w-[450px] mx-4 shrink-0 transition-all duration-300 hover:scale-[1.02]">
                {renderBlock(b, ownerName, ownerEmail, username, theme, true)}
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (block.mode === 'carousel') {
      return (
        <div className="w-full flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 pt-4 [&::-webkit-scrollbar]:hidden">
          {items.map((b) => (
            <div key={b.id} className="min-w-[85vw] md:min-w-[400px] snap-center shrink-0">
               {renderBlock(b, ownerName, ownerEmail, username, theme)}
            </div>
          ))}
        </div>
      )
    }

    // Default Grids
    return (
      <div className={`w-full grid gap-8 ${block.mode === 'grid-3' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        {items.map((b) => renderBlock(b, ownerName, ownerEmail, username, theme))}
      </div>
    )
  }

  // --------------------------------------------------
  // 2. HANDLE SINGLE BLOCKS
  // --------------------------------------------------
  if (!block.visible) return null

  const mw = MAX_WIDTH[block.settings.maxWidth || 'lg']
  const al = ALIGN[block.settings.alignment || 'left']

  return (
    <AnimationWrapper animation={block.animation}>
      <div
        className={`w-full flex flex-col ${al} py-4`}
        style={{
          backgroundColor: block.settings.backgroundColor || 'transparent',
          color: block.settings.textColor || undefined,
          paddingTop: block.settings.paddingTop ?? undefined,
          paddingBottom: block.settings.paddingBottom ?? undefined,
        }}
      >
        <div className={`w-full ${mw}`}>
          {renderBlock(block, ownerName, ownerEmail, username, theme)}
        </div>
      </div>
    </AnimationWrapper>
  )
}

function renderBlock(block: Block, ownerName: string, ownerEmail: string, username?: string, theme?: PortfolioTheme, inMarquee = false) {
  switch (block.type) {
    case 'text':        return <TextBlock content={block.content as never} />
    case 'image':       return <ImageBlock content={block.content as never} theme={theme} />
    case 'youtube':     return <YouTubeBlock content={block.content as never} />
    case 'instagram':   return <InstagramBlock content={block.content as never} />
    case 'linkedin':    return <LinkedInBlock content={block.content as never} theme={theme} />
    case 'map':         return <MapBlock content={block.content as never} />
    case 'pdf':         return <PDFBlock content={block.content as never} />
    case 'testimonial': return <TestimonialBlock content={block.content as never} theme={theme} inMarquee={inMarquee} />
    case 'experience':  return <ExperienceBlock content={block.content as never} theme={theme} />
    case 'service':     return <ServiceBlock content={block.content as never} ownerName={ownerName} ownerEmail={ownerEmail} />
    case 'button':      return <ButtonBlock content={block.content as never} />
    case 'blog':        return <BlogBlock content={block.content as never} username={username} />
    case 'skills':      return <SkillsBlock content={block.content as never} />
    case 'project':     return <ProjectBlock content={block.content as never} />
    case 'social':      return <SocialBlock content={block.content as never} />
    case 'divider':     return <DividerBlock content={block.content as never} />
    case 'contact':     return <ContactBlock />
    default:            return null
  }
}