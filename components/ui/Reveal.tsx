'use client'
// components/ui/Reveal.tsx
//
// Scroll-triggered reveal. Deliberately CSS-only once mounted — no animation
// library, no layout thrash.
//
// The important detail: the pre-reveal state is `opacity-0`, so if the observer
// never fires the content is *invisible*, not merely un-animated. So we bail to
// the visible state immediately when the user prefers reduced motion or the API
// is missing, rather than trusting the observer to always run.

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export type RevealKind = 'none' | 'fade' | 'up' | 'left' | 'zoom'

const FROM: Record<RevealKind, string> = {
  none: '',
  fade: 'opacity-0',
  up: 'opacity-0 translate-y-6',
  left: 'opacity-0 -translate-x-6',
  zoom: 'opacity-0 scale-[0.97]',
}

const TO: Record<RevealKind, string> = {
  none: '',
  fade: 'opacity-100',
  up: 'opacity-100 translate-y-0',
  left: 'opacity-100 translate-x-0',
  zoom: 'opacity-100 scale-100',
}

interface Props {
  kind?: RevealKind
  /** Milliseconds. Use small, staggered values inside a list. */
  delay?: number
  className?: string
  as?: 'div' | 'li' | 'span' | 'section'
  children: React.ReactNode
}

export default function Reveal({
  kind = 'up',
  delay = 0,
  className,
  as: Tag = 'div',
  children,
}: Props) {
  const ref = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(kind === 'none')

  useEffect(() => {
    if (kind === 'none' || shown) return

    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced || typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }

    const el = ref.current
    if (!el) {
      setShown(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [kind, shown])

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        kind !== 'none' && 'transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
        shown ? TO[kind] : FROM[kind],
        className
      )}
    >
      {children}
    </Tag>
  )
}
