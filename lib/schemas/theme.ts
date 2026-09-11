// lib/schemas/theme.ts
//
// Singleton: `theme/active`.
//
// This document holds OVERRIDES ONLY, never a full copy of the palette. The
// @theme block in app/globals.css stays the source of truth, so a half-written
// theme can only shift the tokens it names — it can never white-screen the site
// by omitting one.
//
// SECURITY: every value here is interpolated into a <style> element. A token
// value of `red; } html { display: none` would be CSS injection with a real
// impact (hiding content, repositioning an overlay over a button). So colours
// are restricted to hex literals — exactly what a colour input produces — and
// every numeric is clamped. Nothing free-form reaches the stylesheet.

import { z } from 'zod'
import type { SectionKey } from '@/types/site'

/** The tokens /admin/theme is allowed to override. Names match --color-* in globals.css. */
export const THEME_TOKENS = [
  'paper',
  'paper-deep',
  'card',
  'ink',
  'ink-soft',
  'rule',
  'coral',
  'coral-deep',
  'coral-ink',
  'coral-soft',
  'slate-deep',
] as const
export type ThemeToken = (typeof THEME_TOKENS)[number]

/**
 * #rgb, #rgba, #rrggbb, #rrggbbaa. Deliberately narrower than CSS allows:
 * no rgb()/oklch()/var(), because those carry parentheses and commas that turn
 * a validator into a parser, and a colour picker never needs them.
 */
const hexColor = z
  .string()
  .trim()
  .regex(/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, {
    error: 'Use a hex colour like #fbf7f0.',
  })

/**
 * z.record(z.enum(...)) is EXHAUSTIVE in Zod 4 — it would demand every token.
 * partialRecord is the one that means "some of these keys", and it rejects keys
 * outside the list, which is the allowlist this needs.
 */
const palette = z.partialRecord(z.enum(THEME_TOKENS), hexColor).default({})

export const HERO_LAYOUTS = ['stacked', 'split', 'portrait-left'] as const
export type HeroLayout = (typeof HERO_LAYOUTS)[number]

export const RADIUS_SCALES = ['sharp', 'soft', 'round'] as const
export type RadiusScale = (typeof RADIUS_SCALES)[number]

export const DARK_MODES = ['off', 'toggle', 'auto'] as const
export type DarkMode = (typeof DARK_MODES)[number]

/** Concrete radius values per scale. Kept here so the admin can preview them. */
export const RADIUS_VALUES: Record<RadiusScale, string> = {
  sharp: '0.125rem',
  soft: '0.5rem',
  round: '1rem',
}

export const themeSchema = z.object({
  light: palette,
  dark: palette,

  meta: z.object({
    name: z.string().min(1, 'Name is required'),
    descriptor: z.string().min(1, 'Short description is required'),
    availability: z.string().default('Available for new projects'),
    twitterHandle: z.string().optional(),
    keywords: z.string().optional(),
    ogImageUrl: z.string().optional(),
  }).default({
    name: 'Your Name',
    descriptor: 'Your Description',
    availability: 'Available for new projects',
  }),

  /** Multiplies every fluid type clamp. Narrow on purpose — 1.4 would break layout. */
  typeScale: z.number().min(0.85).max(1.2).default(1),
  radius: z.enum(RADIUS_SCALES).default('soft'),
  /** Paper grain opacity. 0 turns the texture off entirely. */
  grain: z.number().min(0).max(0.12).default(0.035),

  heroLayout: z.enum(HERO_LAYOUTS).default('stacked'),
  darkMode: z.enum(DARK_MODES).default('off'),

  /**
   * Homepage section order and visibility. Empty means "use the built-in order",
   * so adding a new section to types/site.ts does not require a theme migration.
   */
  sections: z
    .array(
      z.object({
        key: z.string().trim().max(40),
        visible: z.boolean().default(true),
      })
    )
    .max(40)
    .default([]),

  updatedAt: z.number().int().default(0),
})

export type Theme = z.infer<typeof themeSchema>

export const THEME_COLLECTION = 'theme'
export const THEME_DOC = 'active'

export const DEFAULT_THEME: Theme = themeSchema.parse({})

/**
 * A dark palette that keeps the paper-desk feel rather than inverting it:
 * warm near-black rather than #000, ink lifted to a warm off-white, and coral
 * brightened so it still reads as the accent against a dark ground.
 *
 * Contrast against --paper #16130f: ink #f2ece1 = 14.9:1, ink-soft #b3a999 = 7.6:1,
 * coral-ink #ff8a6d = 7.0:1. All comfortably past AA.
 */
export const DARK_PRESET: Partial<Record<ThemeToken, string>> = {
  paper: '#16130f',
  'paper-deep': '#0f0d0a',
  card: '#1e1a15',
  ink: '#f2ece1',
  'ink-soft': '#b3a999',
  rule: '#332c23',
  coral: '#ff6b4f',
  'coral-deep': '#ff7a5c',
  'coral-ink': '#ff8a6d',
  'coral-soft': '#3a221b',
  'slate-deep': '#0b0907',
}

/** Section order used when `sections` is empty. Mirrors app/page.tsx. */
export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  'hero',
  'creds',
  'proof',
  'audiences',
  'ways',
  'ventures',
  'projects',
  'pov',
  'contrasts',
  'gallery',
  'writing',
  'oneCard',
  'closing',
]
