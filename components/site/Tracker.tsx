'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function Tracker() {
  const pathname = usePathname()
  const trackedPath = useRef('')

  useEffect(() => {
    // Only track once per path change
    if (trackedPath.current === pathname) return
    trackedPath.current = pathname

    // Don't track admin pages
    if (pathname.startsWith('/admin')) return

    try {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: pathname,
          referrer: document.referrer
        })
      })
    } catch (e) {
      // Ignore silently
    }
  }, [pathname])

  return null
}
