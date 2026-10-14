'use client'
// components/site/BackToTop.tsx
//
// A floating control that appears once the reader is well down the page and
// returns them to the top. Honours prefers-reduced-motion by jumping instead
// of animating the scroll.

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BackToTop({ threshold = 700 }: { threshold?: number }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
      className={cn(
        'fixed bottom-5 right-5 z-50 grid size-11 place-items-center rounded-full sm:bottom-7 sm:right-7',
        'bg-coral-deep text-white shadow-lift ring-1 ring-black/5',
        'transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-coral-ink',
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      )}
    >
      <ArrowUp className="size-5" strokeWidth={2.25} />
    </button>
  )
}
