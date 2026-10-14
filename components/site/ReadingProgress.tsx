'use client'
// components/site/ReadingProgress.tsx
//
// A thin coral bar pinned to the very top of the viewport that fills as the
// reader moves down an article. Decorative (aria-hidden) — it mirrors scroll,
// it doesn't convey anything a screen reader needs. scaleX keeps it off the
// layout's critical path; the reduced-motion rule in globals.css leaves the
// transform instantaneous, which is exactly what a progress indicator wants.

import { useEffect, useState } from 'react'

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      setProgress(max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]" aria-hidden="true">
      <div
        className="h-full origin-left bg-coral will-change-transform"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  )
}
