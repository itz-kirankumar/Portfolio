// lib/sanitize.ts
//
// Allowlist sanitiser for editor HTML. Runs server-side on every write, so
// nothing unsafe is ever stored — not merely never rendered.
//
// The approach is REBUILD, not filter. We tokenise the input and emit a fresh
// canonical document containing only tags we recognise, with only attributes we
// recognise, with all text re-escaped. Filtering ("delete the bad bits") loses
// to malformed input, because then the attacker decides what "a tag" means and
// the browser's parser is more forgiving than any regex. Rebuilding means
// anything we fail to understand becomes inert text or disappears — the failure
// mode is a mangled paragraph, not an injection.
//
// Why not a library: the owner is the only author, so this defends against
// pasted content and a hijacked session rather than hostile users, and the
// project has a standing no-new-dependencies constraint.

/* ------------------------------------------------------------- allowlist --- */

/** tag -> attributes permitted on it. Everything else is dropped. */
const ALLOWED: Record<string, string[]> = {
  p: [],
  br: [],
  hr: [],
  h1: [],
  h2: [],
  h3: [],
  h4: [],
  h5: [],
  h6: [],
  strong: [],
  b: [],
  em: [],
  i: [],
  u: [],
  s: [],
  del: [],
  ins: [],
  mark: [],
  sub: [],
  sup: [],
  small: [],
  code: [],
  kbd: [],
  pre: [],
  blockquote: ['cite'],
  ul: [],
  ol: ['start'],
  li: [],
  a: ['href', 'title', 'target'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  figure: [],
  figcaption: [],
  table: [],
  thead: [],
  tbody: [],
  tfoot: [],
  tr: [],
  th: ['colspan', 'rowspan'],
  td: ['colspan', 'rowspan'],
  // The Tiptap embed node. Each attribute is validated individually below, and
  // the public renderer reads them to mount a React component — the div itself
  // never carries third-party markup.
  div: ['data-embed', 'data-platform', 'data-url', 'data-media-id'],
  // TextStyle/Color emits <span style="color: …">. Only that one declaration
  // survives; see SAFE_STYLE.
  span: ['style'],
}

const VOID_TAGS = new Set(['br', 'hr', 'img'])

/**
 * Tags dropped along with everything inside them. Keeping the contents would
 * turn `<script>alert(1)</script>` into the visible text "alert(1)" — harmless,
 * but obviously wrong in an article.
 */
const DROP_SUBTREE = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'noscript',
  'template',
  'svg',
  'math',
  'form',
  'input',
  'button',
  'select',
  'option',
  'textarea',
  'link',
  'meta',
  'base',
  'title',
  'head',
])

/** Only `color: #hex` survives. A `position: fixed` overlay is clickjacking. */
const SAFE_STYLE = /^\s*color\s*:\s*(#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8}))\s*;?\s*$/

const SAFE_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:']

const EMBED_PLATFORM = /^[a-z]{1,20}$/
const NUMERIC_ATTR = /^\d{1,5}$/
const MEDIA_ID = /^[a-zA-Z0-9_-]{1,64}$/

/* ------------------------------------------------------ entities, escape --- */

const NAMED: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

function safeFromCodePoint(code: number): string {
  try {
    return String.fromCodePoint(code)
  } catch {
    return ''
  }
}

/**
 * Decode before validating, encode after. Without the decode step,
 * `&#106;avascript:alert(1)` reaches the browser as `javascript:` while our
 * scheme check sees a harmless string starting with `&`.
 */
function decodeEntities(input: string): string {
  return input.replace(
    /&(#[xX][0-9a-fA-F]{1,6}|#\d{1,7}|[a-zA-Z][a-zA-Z0-9]{1,10});?/g,
    (match, body: string) => {
      if (body[0] === '#') {
        const hex = body[1] === 'x' || body[1] === 'X'
        const code = Number.parseInt(hex ? body.slice(2) : body.slice(1), hex ? 16 : 10)
        return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? safeFromCodePoint(code) : ''
      }
      return NAMED[body.toLowerCase()] ?? match
    }
  )
}

function escapeText(input: string): string {
  return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Values are always emitted double-quoted, so escaping `"` is what actually
 * prevents an attribute break. The backtick is escaped too: it is inert inside
 * quotes everywhere, but old IE treated it as a delimiter in unquoted contexts,
 * and one more replace is cheaper than reasoning about that every time this
 * function is read.
 */
function escapeAttr(input: string): string {
  return escapeText(input).replace(/"/g, '&quot;').replace(/`/g, '&#96;')
}

/* ------------------------------------------------------------------ urls --- */

/**
 * Characters browsers ignore inside a scheme. Built from an escaped string so
 * no invisible control character ever lands in this source file.
 */
const URL_NOISE = new RegExp(
  '[\\u0000-\\u0020\\u00a0\\u1680\\u2000-\\u200f\\u2028-\\u202f\\u205f\\u2060\\u3000\\ufeff]',
  'g'
)

/**
 * Returns a safe URL, or null. Noise characters are stripped first: browsers
 * ignore tabs and newlines inside a scheme, so `java&#9;script:alert(1)` runs
 * while a naive `startsWith('javascript:')` check waves it through.
 */
function safeUrl(raw: string, { allowRelative = true } = {}): string | null {
  const value = decodeEntities(raw).replace(URL_NOISE, '')
  if (!value) return null

  // Protocol-relative `//evil.com` looks relative but is a scheme swap.
  if (value.startsWith('//')) return null

  if (allowRelative && (value.startsWith('/') || value.startsWith('#') || value.startsWith('.'))) {
    return value
  }

  const scheme = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(value)
  if (!scheme) return allowRelative ? value : null

  return SAFE_SCHEMES.includes(`${scheme[1].toLowerCase()}:`) ? value : null
}

/* ------------------------------------------------------------ attributes --- */

const ATTR_RE = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g

function parseAttrs(source: string): Map<string, string> {
  const out = new Map<string, string>()
  ATTR_RE.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = ATTR_RE.exec(source)) !== null) {
    const name = match[1].toLowerCase()
    if (!out.has(name)) out.set(name, match[2] ?? match[3] ?? match[4] ?? '')
  }
  return out
}

/** Attribute string for one allowed tag. Anything unrecognised is dropped. */
function cleanAttrs(tag: string, attrs: Map<string, string>): string {
  const parts: string[] = []

  for (const name of ALLOWED[tag]) {
    if (!attrs.has(name)) continue
    const raw = attrs.get(name) as string
    let value: string | null

    switch (name) {
      case 'href':
        value = safeUrl(raw)
        break
      case 'src':
        value = safeUrl(raw)
        break
      case 'data-url':
        value = safeUrl(raw, { allowRelative: false })
        break
      case 'target':
        value = raw.toLowerCase() === '_blank' ? '_blank' : null
        break
      case 'style': {
        const m = SAFE_STYLE.exec(decodeEntities(raw))
        value = m ? `color: ${m[1]}` : null
        break
      }
      case 'data-platform': {
        const v = decodeEntities(raw).toLowerCase()
        value = EMBED_PLATFORM.test(v) ? v : null
        break
      }
      case 'data-media-id': {
        const v = decodeEntities(raw)
        value = MEDIA_ID.test(v) ? v : null
        break
      }
      case 'data-embed':
        value = ''
        break
      case 'width':
      case 'height':
      case 'colspan':
      case 'rowspan':
      case 'start': {
        const v = decodeEntities(raw).trim()
        value = NUMERIC_ATTR.test(v) ? v : null
        break
      }
      default:
        value = decodeEntities(raw).slice(0, 500)
    }

    if (value === null) continue
    parts.push(value === '' ? name : `${name}="${escapeAttr(value)}"`)
  }

  // `rel` is never taken from input — it is recomputed. target=_blank without
  // noopener hands window.opener to the destination.
  if (tag === 'a') {
    const href = attrs.get('href')
    const url = href ? safeUrl(href) : null
    if (url && /^https?:/i.test(url)) {
      if (!parts.some((p) => p.startsWith('target='))) parts.push('target="_blank"')
      parts.push('rel="noopener noreferrer nofollow"')
    }
  }

  return parts.length ? ` ${parts.join(' ')}` : ''
}

/* ------------------------------------------------------------- tokeniser --- */

// Sticky: it must match a tag AT the `<` we found, never search forward.
const TAG_RE = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/y

export interface SanitizeOptions {
  /**
   * Hard cap on the returned string. Pass the same number as the calling
   * schema's `.max()`: the cap is exact, so the result can never be the thing
   * that fails validation.
   */
  maxLength?: number
}

export function sanitizeHtml(input: string, options: SanitizeOptions = {}): string {
  if (!input) return ''

  const maxLength = options.maxLength ?? 400_000
  const out: string[] = []
  const stack: string[] = []

  let length = 0
  let i = 0
  let text = ''

  /**
   * Characters owed to the closing tags of everything currently open. Held back
   * from the budget so the document always closes, however abruptly we stop.
   */
  let closeCost = 0
  const room = () => maxLength - length - closeCost

  /** All-or-nothing: a half-written tag is worse than no tag. */
  const pushTag = (chunk: string): boolean => {
    if (chunk.length > room()) return false
    out.push(chunk)
    length += chunk.length
    return true
  }

  /** Text may be clipped — it is already escaped, so a cut costs a word at most. */
  const pushText = (chunk: string) => {
    const space = room()
    if (space <= 0) return
    const slice = chunk.length > space ? chunk.slice(0, space) : chunk
    out.push(slice)
    length += slice.length
  }

  /** Closes back down to `depth`. Always fits — closeCost reserved the space. */
  const popTo = (depth: number) => {
    while (stack.length > depth) {
      const close = `</${stack.pop()}>`
      out.push(close)
      length += close.length
      closeCost -= close.length
    }
  }

  const flushText = () => {
    if (!text) return
    pushText(escapeText(decodeEntities(text)))
    text = ''
  }

  while (i < input.length) {
    if (room() <= 0) break

    const lt = input.indexOf('<', i)

    if (lt === -1) {
      text += input.slice(i)
      break
    }

    text += input.slice(i, lt)

    // Comments, CDATA, doctypes, processing instructions: dropped whole.
    if (input.startsWith('<!--', lt)) {
      const end = input.indexOf('-->', lt + 4)
      i = end === -1 ? input.length : end + 3
      continue
    }
    if (input.startsWith('<!', lt) || input.startsWith('<?', lt)) {
      const end = input.indexOf('>', lt + 2)
      i = end === -1 ? input.length : end + 1
      continue
    }

    TAG_RE.lastIndex = lt
    const match = TAG_RE.exec(input)

    if (!match) {
      // Not a tag — a bare `<` in prose. Keep it as text so it gets escaped.
      text += '<'
      i = lt + 1
      continue
    }

    const [full, slash, rawName, rawAttrs] = match
    const tag = rawName.toLowerCase()
    const closing = slash === '/'
    i = lt + full.length

    if (DROP_SUBTREE.has(tag)) {
      if (!closing) i = skipSubtree(input, i, tag)
      continue
    }

    if (!(tag in ALLOWED)) continue // unknown tag: drop the tag, keep its text

    const attrs = closing ? null : parseAttrs(rawAttrs)

    // A bare <div> would let a paste restructure the page around the article.
    // Only the embed node survives. Its children and closing tag are handled
    // naturally: the </div> becomes a stray close and is dropped below.
    if (tag === 'div' && !closing && !attrs?.has('data-embed')) continue

    flushText()

    if (closing) {
      // Stray close tag: drop it rather than emit markup that closes one of
      // OUR wrappers and lets content escape the article container.
      const depth = stack.lastIndexOf(tag)
      if (depth === -1) continue
      popTo(depth)
      continue
    }

    const cleaned = cleanAttrs(tag, attrs as Map<string, string>)

    if (VOID_TAGS.has(tag)) {
      // An <img> whose src failed validation is just an empty box.
      if (tag === 'img' && !cleaned.includes('src=')) continue
      if (!pushTag(`<${tag}${cleaned} />`)) break
      continue
    }

    // Reserve the close before emitting the open, so the pair is atomic.
    const closeLen = tag.length + 3
    if (closeLen > room()) break
    closeCost += closeLen

    if (!pushTag(`<${tag}${cleaned}>`)) {
      closeCost -= closeLen
      break
    }
    stack.push(tag)
  }

  flushText()
  popTo(0)

  return out.join('')
}

/**
 * Index just past the matching `</tag>`, or the end of input.
 *
 * Deliberately does not track nesting. None of the DROP_SUBTREE tags nest
 * meaningfully, and stopping at the first close is safe either way: whatever
 * follows is re-tokenised normally, where leftover children are unknown tags
 * and get dropped.
 */
function skipSubtree(input: string, from: number, tag: string): number {
  const close = new RegExp(`</${tag}\\s*>`, 'i')
  const rest = input.slice(from)
  const match = close.exec(rest)
  return match ? from + match.index + match[0].length : input.length
}

/** Body text with all markup removed. For excerpts, search and email preheaders. */
export function htmlToText(input: string): string {
  return decodeEntities(
    input
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|h[1-6]|li|blockquote|tr)>/gi, '\n')
      .replace(/<[^>]*>/g, ' ')
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
