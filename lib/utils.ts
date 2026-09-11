// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncate(text: string, length = 100): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '…'
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// Removed from this file rather than left as unused twins, because each had a
// better-behaved counterpart elsewhere and importing the wrong one is silent:
//   slugify       -> lib/ids.ts        (folds accents: "café" -> "cafe", not "caf")
//   formatCurrency-> lib/schemas/service.ts formatPrice (paise ints, not floats)
//   getYouTubeId  -> lib/embeds.ts     (handles /shorts/ and /live/ URLs)
