// lib/tags.ts
//
// Utility functions for normalizing, sanitizing, and formatting post tags/topics.
// Ensures tags are clean, readable, free of hashtag symbols, and properly deduplicated.

const CANONICAL_MAP: Record<string, string> = {
  indiancanvas: 'Indian Canvas',
  'indian canvas': 'Indian Canvas',
  startups: 'Startups',
  startup: 'Startups',
  'startup ideas': 'Startups',
  saas: 'SaaS',
  ai: 'AI',
  deeptech: 'DeepTech',
  'deep tech': 'DeepTech',
  cleantech: 'Cleantech',
  'clean tech': 'Cleantech',
  healthtech: 'Healthtech',
  'health tech': 'Healthtech',
  insurtech: 'Insurtech',
  'insur tech': 'Insurtech',
  fintech: 'Fintech',
  'fin tech': 'Fintech',
  agritech: 'Agritech',
  'agri tech': 'Agritech',
  biotech: 'Biotech',
  'bio tech': 'Biotech',
  repaireconomy: 'Repair Economy',
  'repair economy': 'Repair Economy',
  b2b: 'B2B',
  b2c: 'B2C',
  b2g: 'B2G',
  msme: 'MSME',
  nri: 'NRI',
  rbi: 'RBI',
  upi: 'UPI',
  epr: 'EPR',
}

export function cleanSingleTag(raw: string): string {
  if (!raw) return ''
  const clean = raw.trim().replace(/^#+/, '').replace(/#+$/, '').trim()
  if (!clean) return ''
  const lower = clean.toLowerCase()
  if (CANONICAL_MAP[lower]) return CANONICAL_MAP[lower]
  if (clean === clean.toLowerCase()) {
    return clean.charAt(0).toUpperCase() + clean.slice(1)
  }
  return clean
}

export function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return []
  const result: string[] = []
  const seen = new Set<string>()

  for (const item of tags) {
    if (typeof item !== 'string') continue
    const trimmed = item.trim()
    if (!trimmed) continue

    let parts: string[] = []
    if (trimmed.includes('#')) {
      const matches = trimmed.match(/#[^\s#]+/g)
      if (matches && matches.length > 0) {
        parts = matches
      } else {
        parts = [trimmed]
      }
    } else if (trimmed.includes(',')) {
      parts = trimmed.split(',')
    } else {
      parts = [trimmed]
    }

    for (const part of parts) {
      const cleaned = cleanSingleTag(part)
      if (cleaned) {
        const key = cleaned.toLowerCase()
        if (!seen.has(key)) {
          seen.add(key)
          result.push(cleaned)
        }
      }
    }
  }

  return result
}
