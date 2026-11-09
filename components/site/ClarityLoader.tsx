'use client'

// Microsoft Clarity, portfolio project only (kirankumarg.me, ID zath09upbe).
// Never loads on admin or login surfaces: those carry private dashboards and
// owner-only data, so they are excluded from session recording entirely.
// User-input surfaces elsewhere carry data-clarity-mask="true" so entered
// text is masked regardless of dashboard settings.

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const CLARITY_ID = 'zath09upbe'
const EXCLUDED_PREFIXES = ['/admin', '/login']

export function ClarityLoader() {
  const pathname = usePathname() ?? ''
  const excluded = EXCLUDED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  )

  useEffect(() => {
    if (excluded) return
    const w = window as unknown as {
      clarity?: ((...args: unknown[]) => void) & { q?: unknown[] }
    }
    if (w.clarity) return
    const clarity = ((...args: unknown[]) => {
      ;(clarity.q = clarity.q || []).push(args)
    }) as ((...args: unknown[]) => void) & { q?: unknown[] }
    w.clarity = clarity
    const t = document.createElement('script')
    t.async = true
    t.src = 'https://www.clarity.ms/tag/' + CLARITY_ID
    const first = document.getElementsByTagName('script')[0]
    first?.parentNode?.insertBefore(t, first)
  }, [excluded])

  return null
}
