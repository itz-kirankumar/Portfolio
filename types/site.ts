// types/site.ts
//
// The shape of the single Firestore document `site/content`.
//
// Two constraints shaped this file, both worth knowing before you edit it:
//
//   1. Firestore cannot nest an array directly inside an array. `array -> map ->
//      array` is fine (`ventures.items[].outcomes`), `array -> array` is not.
//      Every list of lists here therefore goes through an object.
//   2. Every top-level key maps 1:1 to a section and is written/read as a whole
//      unit (see `lib/site.ts`). Adding a key means adding it to
//      DEFAULT_CONTENT and to SECTION_SCHEMAS, or it can never be edited.

/** Bump when a stored shape changes incompatibly; drives `migrate()`. */
export const SCHEMA_VERSION = 1

export interface Link {
  label: string
  href: string
}

export interface Photo {
  /** Absolute URL (Firebase Storage) or a path under /public. */
  src: string
  alt: string
  /** Handwritten caption shown under a polaroid. Optional. */
  caption?: string
  /** Degrees of tilt, -6..6. Small numbers read as accidental; large as clumsy. */
  rotate?: number
}

/* --------------------------------------------------------- 0 · identity --- */

export interface Meta {
  name: string
  /** One line under the name in the footer and in structured data. */
  descriptor: string
  email: string
  phone: string
  location: string
  linkedin: string
  /** Uploaded via /admin/media. Empty string hides every résumé link. */
  resumeUrl: string
}

/* ------------------------------------------------------- 1 · utility bar --- */

export interface UtilityContent {
  /** e.g. "open to product & strategy roles". Empty hides the bar. */
  status: string
  /** Shown next to a live clock. */
  timezoneLabel: string
  /** IANA zone used for the clock, e.g. "Asia/Kolkata". */
  timezone: string
}

/* --------------------------------------------------------------- 2 · nav --- */

export interface NavContent {
  /** Wordmark text, left of the links. */
  brand: string
  links: Link[]
  cta: Link
}

/* -------------------------------------------------------------- 3 · hero --- */

export interface HeroContent {
  eyebrow: string
  /** Headline is split so the coral marker sweep is editable content, not code. */
  headlineBefore: string
  headlineHighlight: string
  headlineAfter: string
  subhead: string
  primaryCta: Link
  secondaryCta: Link
  portrait: Photo
  /** Handwritten scrawl beside the portrait. Empty hides it. */
  scribble: string
}

/* ------------------------------------------------------------- 4 · creds --- */

export interface CredsContent {
  label: string
  items: { text: string; year: string }[]
}

/* ------------------------------------------------------------- 5 · proof --- */

export interface ProofContent {
  heading: string
  metrics: { value: string; label: string; context: string }[]
}

/* --------------------------------------------------------- 6 · audiences --- */

export interface Audience {
  key: string
  title: string
  /** "You bring …" */
  bring: string
  /** "You leave with …" — a short list. */
  outcomes: string[]
  cta: Link
}

export interface AudiencesContent {
  eyebrow: string
  heading: string
  intro: string
  items: Audience[]
}

/* -------------------------------------------------------------- 7 · ways --- */

export interface Way {
  /** "01", "02", "03" — displayed verbatim. */
  number: string
  title: string
  body: string
  bullets: string[]
}

export interface WaysContent {
  eyebrow: string
  heading: string
  items: Way[]
  /** Organisations, rendered as a quiet row under the three ways. */
  worked: { name: string; note: string }[]
  workedLabel: string
}

/* ---------------------------------------------------------- 8 · ventures --- */

export interface Venture {
  name: string
  url: string
  role: string
  period: string
  place: string
  /** One sentence: what it is. */
  summary: string
  /** What actually happened, in outcome-first language. */
  outcomes: string[]
  /** Up to 4; rendered as a small stat row inside the card. */
  metrics: { value: string; label: string }[]
  status: 'live' | 'building' | 'closed'
  tags: string[]
}

export interface VenturesContent {
  eyebrow: string
  heading: string
  intro: string
  items: Venture[]
}

/* ---------------------------------------------------------- 9 · projects --- */

export interface Project {
  title: string
  kind: string
  period: string
  body: string
  highlights: string[]
  /** e.g. "Patent E-2/583/2023-CHE" or "Best Paper · ICA6NT 2025". */
  badge: string
}

export interface ProjectsContent {
  eyebrow: string
  heading: string
  items: Project[]
}

/* ----------------------------------------------------- 10 · point of view --- */

export interface PovContent {
  eyebrow: string
  /** The opinion. This is the most distinctive line on the page. */
  heading: string
  intro: string
  items: { number: string; title: string; body: string }[]
  pullQuote: string
}

/* -------------------------------------------------------- 11 · contrasts --- */

export interface ContrastsContent {
  eyebrow: string
  heading: string
  items: { before: string; after: string }[]
}

/* ---------------------------------------------------------- 12 · gallery --- */

export interface GalleryContent {
  eyebrow: string
  heading: string
  photos: Photo[]
}

/* ---------------------------------------------------------- 13 · writing --- */

export interface WritingContent {
  eyebrow: string
  heading: string
  intro: string
  posts: { title: string; blurb: string; href: string; date: string }[]
  cta: Link
}

/* --------------------------------------------------------- 14 · one card --- */

export interface OneCardContent {
  /** Handwritten heading on the notebook page. */
  heading: string
  bullets: string[]
  /** Signature line, set in the hand font. */
  signature: string
}

/* ---------------------------------------------------------- 15 · closing --- */

export interface ClosingContent {
  /** Script heading, e.g. "Let's build". */
  heading: string
  body: string
  primaryCta: Link
  secondaryCta: Link
  /** Small reassurance under the buttons. */
  note: string
}

/* ----------------------------------------------------------- 16 · footer --- */

export interface FooterContent {
  links: Link[]
  colophon: string
}

/* ------------------------------------------------------------------------- */

export interface SiteContent {
  meta: Meta
  utility: UtilityContent
  nav: NavContent
  hero: HeroContent
  creds: CredsContent
  proof: ProofContent
  audiences: AudiencesContent
  ways: WaysContent
  ventures: VenturesContent
  projects: ProjectsContent
  pov: PovContent
  contrasts: ContrastsContent
  gallery: GalleryContent
  writing: WritingContent
  oneCard: OneCardContent
  closing: ClosingContent
  footer: FooterContent
}

export type SectionKey = keyof SiteContent

/** Stored document = content + bookkeeping. */
export interface StoredSite extends Partial<SiteContent> {
  schemaVersion?: number
  updatedAt?: number
}
