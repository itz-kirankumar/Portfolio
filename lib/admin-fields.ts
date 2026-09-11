// lib/admin-fields.ts
//
// Field metadata for the generic /admin editor. The editor walks the section's
// value and renders inputs from its shape, so all it needs from here is:
//
//   * how a given key should be *presented* (long text, URL, image, enum, …)
//   * what a *new* row in a given array should look like
//
// ROW_TEMPLATES is explicit rather than derived from DEFAULT_CONTENT on
// purpose. Deriving would work for most arrays but break on the ones that ship
// empty (gallery.photos, writing.posts) — there is no sample row to clone, so
// "Add" would insert `{}` and fail Zod with an unhelpful message.

/** Multi-line inputs. Matched on the leaf key name. */
export const LONG_TEXT_KEYS = new Set([
  'subhead',
  'intro',
  'body',
  'summary',
  'bring',
  'blurb',
  'note',
  'colophon',
  'pullQuote',
  'scribble',
  'descriptor',
])

/** Rendered with type="url"-ish affordances and no spellcheck. */
export const URL_KEYS = new Set(['href', 'url', 'linkedin', 'resumeUrl', 'src'])

/** Gets an upload button and a preview. */
export const IMAGE_KEYS = new Set(['src'])

export const NUMBER_KEYS = new Set(['rotate'])

/** Leaf keys rendered as a <select>. */
export const ENUM_OPTIONS: Record<string, string[]> = {
  status: ['live', 'building', 'closed'],
}

/** Keys the editor hides — machine-only identifiers. */
export const HIDDEN_KEYS = new Set<string>([])

/** Friendlier labels than a naive de-camelCase would give. */
export const LABEL_OVERRIDES: Record<string, string> = {
  headlineBefore: 'Headline — before the marker',
  headlineHighlight: 'Headline — marked words',
  headlineAfter: 'Headline — after the marker',
  primaryCta: 'Primary button',
  secondaryCta: 'Secondary button',
  cta: 'Button',
  href: 'Link',
  src: 'Image',
  bring: 'You bring',
  outcomes: 'You leave with',
  pullQuote: 'Pull quote',
  workedLabel: 'Logo row label',
  worked: 'Organisations',
  timezoneLabel: 'Location label',
  timezone: 'IANA timezone',
  resumeUrl: 'Résumé file URL',
  key: 'Internal id',
  rotate: 'Tilt (degrees)',
  colophon: 'Colophon',
  oneCard: 'Why me card',
}

/** Extra guidance shown under a field. */
export const HELP_TEXT: Record<string, string> = {
  heading: 'Wrap words in *asterisks* to give them the coral marker sweep.',
  timezone: 'e.g. Asia/Kolkata. Drives the live clock in the status bar.',
  rotate: '−8 to 8. Small values read as accidental; large ones read as clumsy.',
  key: 'Not shown on the site. Keep it unique and lowercase.',
  resumeUrl: 'Upload a PDF under Media, then paste its URL here. Empty hides every résumé link.',
  status: 'Controls the badge on the venture card.',
}

/**
 * Blank row for every array in the content model, keyed by the array's path
 * with numeric indices collapsed to `*`.
 */
export const ROW_TEMPLATES: Record<string, unknown> = {
  'nav.links': { label: '', href: '' },
  'creds.items': { text: '', year: '' },
  'proof.metrics': { value: '', label: '', context: '' },

  'audiences.items': {
    key: '',
    title: '',
  bring: '',
    outcomes: [],
    cta: { label: '', href: '' },
  },
  'audiences.items.*.outcomes': '',

  'ways.items': { number: '', title: '', body: '', bullets: [] },
  'ways.items.*.bullets': '',
  'ways.worked': { name: '', note: '' },

  'ventures.items': {
    name: '',
    url: '',
    role: '',
    period: '',
    place: '',
    summary: '',
    outcomes: [],
    metrics: [],
    status: 'building',
    tags: [],
  },
  'ventures.items.*.outcomes': '',
  'ventures.items.*.metrics': { value: '', label: '' },
  'ventures.items.*.tags': '',

  'projects.items': {
    title: '',
    kind: '',
    period: '',
    body: '',
 highlights: [],
    badge: '',
  },
  'projects.items.*.highlights': '',

  'pov.items': { number: '', title: '', body: '' },
  'contrasts.items': { before: '', after: '' },
  'gallery.photos': { src: '', alt: '', caption: '', rotate: 0 },
  'writing.posts': { title: '', blurb: '', href: '', date: '' },
  'oneCard.bullets': '',
  'footer.links': { label: '', href: '' },
}

/** Singular noun for a row inside a given array key. */
export const ROW_LABELS: Record<string, string> = {
  items: 'Item',
  outcomes: 'Outcome',
  links: 'Link',
  photos: 'Photo',
  metrics: 'Metric',
  bullets: 'Point',
  posts: 'Post',
  worked: 'Organisation',
  tags: 'Tag',
  highlights: 'Highlight',
}

/** `['items', 2, 'outcomes']` in section `ways` -> `ways.items.*.outcomes` */
export function templateKey(section: string, path: (string | number)[]): string {
  return [section, ...path.map((p) => (typeof p === 'number' ? '*' : p))].join('.')
}

export function rowTemplate(section: string, path: (string | number)[]): unknown {
  const template = ROW_TEMPLATES[templateKey(section, path)]
  return template === undefined ? '' : structuredClone(template)
}

export function humanize(key: string): string {
  if (LABEL_OVERRIDES[key]) return LABEL_OVERRIDES[key]
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}
