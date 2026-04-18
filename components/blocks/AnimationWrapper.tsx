'use client'
// components/blocks/AnimationWrapper.tsx
import { useEffect, useRef, useState } from 'react'
import type { AnimationType } from '@/types'

const ANIMATIONS: Record<AnimationType, string> = {
  none:      '',
  fadeIn:    'opacity-0 transition-all duration-700 ease-out',
  slideUp:   'opacity-0 translate-y-8 transition-all duration-700 ease-out',
  slideLeft: 'opacity-0 translate-x-8 transition-all duration-700 ease-out',
  zoomIn:    'opacity-0 scale-95 transition-all duration-700 ease-out',
}

const ACTIVE: Record<AnimationType, string> = {
  none:      '',
  fadeIn:    'opacity-100',
  slideUp:   'opacity-100 translate-y-0',
  slideLeft: 'opacity-100 translate-x-0',
  zoomIn:    'opacity-100 scale-100',
}

interface Props {
  animation: AnimationType
  children: React.ReactNode
}

export default function AnimationWrapper({ animation, children }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [triggered, setTriggered] = useState(animation === 'none')

  useEffect(() => {
    if (animation === 'none') return
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); observer.disconnect() } },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [animation])

  return (
    <div
      ref={ref}
      className={`${ANIMATIONS[animation]} ${triggered ? ACTIVE[animation] : ''}`}
    >
      {children}
    </div>
  )
}