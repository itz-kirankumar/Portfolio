'use client'
// components/admin/FieldTree.tsx
//
// A form generated from the *shape* of a section's value. Objects become
// fieldsets, arrays become add/remove/reorder lists, primitives become inputs.
// Presentation hints (long text, URL, image, enum) come from the leaf key name
// via lib/admin-fields.ts, so adding a field to types/site.ts +
// lib/default-content.ts is usually all it takes to get an editor for it.
//
// Plain <img> for previews on purpose: these are admin-only thumbnails of
// arbitrary Storage URLs, and routing them through the image optimiser would
// couple this file to next.config remotePatterns for no user-visible gain.

import { useState } from 'react'
import {
  ENUM_OPTIONS,
  HELP_TEXT,
  HIDDEN_KEYS,
  IMAGE_KEYS,
  LONG_TEXT_KEYS,
  NUMBER_KEYS,
  ROW_LABELS,
  URL_KEYS,
  humanize,
  rowTemplate,
} from '@/lib/admin-fields'
import { uploadFile } from './upload'

export type Path = (string | number)[]

export interface TreeCtx {
  section: string
  onChange: (path: Path, value: unknown) => void
}

const INPUT =
  'w-full rounded-md border border-rule bg-card px-3 py-2 text-[0.92rem] leading-relaxed text-ink placeholder:text-ink-soft/50 outline-none transition focus:border-coral-ink focus:ring-2 focus:ring-coral/20'

const GHOST_BTN =
  'rounded-md border border-rule bg-card px-2 py-1 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-ink-soft transition hover:border-ink-soft hover:text-ink disabled:cursor-not-allowed disabled:opacity-35'

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Empty value of the same shape as `sample`. Enum keys keep a legal option. */
export function blankOf(sample: unknown, key?: string): unknown {
  if (key && ENUM_OPTIONS[key]) return ENUM_OPTIONS[key][0]
  if (Array.isArray(sample)) return []
  if (isPlainObject(sample)) {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(sample)) out[k] = blankOf(v, k)
    return out
  }
  if (typeof sample === 'number') return 0
  if (typeof sample === 'boolean') return false
  return ''
}

/**
 * Fill in keys the stored value is missing, using the default content as the
 * shape reference. Without this, an optional field that was never written
 * (`badge`, `caption`, …) simply wouldn't render, and you could never set it.
 * Unknown extra keys are preserved so nothing is silently dropped on save.
 */
export function fillShape(value: unknown, sample: unknown, key?: string): unknown {
  if (Array.isArray(sample)) {
    if (!Array.isArray(value)) return []
    const rowSample = sample[0]
    return rowSample === undefined ? value : value.map((row) => fillShape(row, rowSample))
  }

  if (isPlainObject(sample)) {
    const src = isPlainObject(value) ? value : {}
    const out: Record<string, unknown> = {}
    for (const [k, s] of Object.entries(sample)) {
      out[k] = k in src ? fillShape(src[k], s, k) : blankOf(s, k)
    }
    for (const [k, v] of Object.entries(src)) if (!(k in out)) out[k] = v
    return out
  }

  return value === undefined || value === null ? blankOf(sample, key) : value
}

export function getAt(root: unknown, path: Path): unknown {
  let cursor: unknown = root
  for (const step of path) {
    if (cursor === null || cursor === undefined) return undefined
    cursor = (cursor as Record<string | number, unknown>)[step]
  }
  return cursor
}

/** Immutable set-at-path. Arrays stay arrays; objects stay objects. */
export function setAt(root: unknown, path: Path, value: unknown): unknown {
  if (path.length === 0) return value
  const [head, ...rest] = path

  if (typeof head === 'number') {
    const next = Array.isArray(root) ? root.slice() : []
    next[head] = setAt(next[head], rest, value)
    return next
  }

  const next: Record<string, unknown> = isPlainObject(root) ? { ...root } : {}
  next[head] = setAt(next[head], rest, value)
  return next
}

function fieldId(section: string, path: Path): string {
  return `f-${section}-${path.join('-') || 'root'}`
}

function rowLabel(key: string): string {
  return ROW_LABELS[key] ?? humanize(key).replace(/s$/, '')
}

/** A short human hint for a collapsed row header. */
function rowTitle(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null
  if (isPlainObject(value)) {
    for (const k of ['title', 'name', 'label', 'text', 'value', 'before', 'heading']) {
      const candidate = value[k]
      if (typeof candidate === 'string' && candidate.trim()) return candidate.trim()
    }
  }
  return null
}

/* ── leaves ─────────────────────────────────────────────────────────── */

function ImageField({
  value,
  id,
  onChange,
}: {
  value: string
  id: string
  onChange: (next: string) => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-16 w-16 shrink-0 rounded-md border border-rule bg-paper-deep object-cover"
          />
        ) : null}

        <div className="min-w-[14rem] flex-1 space-y-2">
          <input
            id={id}
            type="text"
            value={value}
            spellCheck={false}
            placeholder="/media/photo.jpg or an uploaded URL"
            onChange={(e) => onChange(e.target.value)}
            className={INPUT}
          />

          <label className={`${GHOST_BTN} inline-block cursor-pointer`}>
            {busy ? 'Uploading…' : 'Upload'}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={busy}
              onChange={async (e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (!file) return
                setBusy(true)
                setError(null)
                try {
                  const uploaded = await uploadFile(file, 'photos')
                  onChange(uploaded.url)
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Upload failed')
                } finally {
                  setBusy(false)
                }
              }}
            />
          </label>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-[0.8rem] text-coral-ink">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function LeafField({
  value,
  path,
  keyName,
  ctx,
}: {
  value: unknown
  path: Path
  keyName: string
  ctx: TreeCtx
}) {
  const id = fieldId(ctx.section, path)
  const help = HELP_TEXT[keyName]
  const set = (next: unknown) => ctx.onChange(path, next)

  let control

  if (ENUM_OPTIONS[keyName]) {
    control = (
      <select
        id={id}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => set(e.target.value)}
        className={INPUT}
      >
        {ENUM_OPTIONS[keyName].map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    )
  } else if (NUMBER_KEYS.has(keyName) || typeof value === 'number') {
    control = (
      <input
        id={id}
        type="number"
        step="0.5"
        value={typeof value === 'number' ? value : 0}
        onChange={(e) => set(e.target.value === '' ? 0 : Number(e.target.value))}
        className={`${INPUT} max-w-32`}
      />
    )
  } else if (typeof value === 'boolean') {
    control = (
      <input
        id={id}
        type="checkbox"
        checked={value}
        onChange={(e) => set(e.target.checked)}
        className="size-4 accent-coral-deep"
      />
    )
  } else if (IMAGE_KEYS.has(keyName)) {
    control = <ImageField id={id} value={typeof value === 'string' ? value : ''} onChange={set} />
  } else if (LONG_TEXT_KEYS.has(keyName)) {
    control = (
      <textarea
        id={id}
        rows={3}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => set(e.target.value)}
        className={`${INPUT} resize-y`}
      />
    )
  } else {
    control = (
      <input
        id={id}
        type="text"
        value={typeof value === 'string' ? value : ''}
        spellCheck={!URL_KEYS.has(keyName)}
        onChange={(e) => set(e.target.value)}
        className={INPUT}
      />
    )
  }

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block font-mono text-[0.66rem] uppercase tracking-[0.13em] text-ink-soft"
      >
        {humanize(keyName)}
      </label>
      {control}
      {help ? <p className="text-[0.78rem] leading-snug text-ink-soft/85">{help}</p> : null}
    </div>
  )
}

/* ── containers ─────────────────────────────────────────────────────── */

function ArrayField({
  value,
  path,
  keyName,
  ctx,
  depth,
}: {
  value: unknown[]
  path: Path
  keyName: string
  ctx: TreeCtx
  depth: number
}) {
  const noun = rowLabel(keyName)
  const primitives = value.every((row) => !isPlainObject(row) && !Array.isArray(row))

  const replace = (next: unknown[]) => ctx.onChange(path, next)

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return
    const next = value.slice()
    const [row] = next.splice(from, 1)
    next.splice(to, 0, row)
    replace(next)
  }

  const remove = (index: number) => replace(value.filter((_, i) => i !== index))
  const add = () => replace([...value, rowTemplate(ctx.section, path)])

  return (
    <section className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-mono text-[0.66rem] uppercase tracking-[0.13em] text-ink-soft">
          {humanize(keyName)}
          <span className="ml-2 text-ink-soft/60">{value.length}</span>
        </h3>
        <button type="button" onClick={add} className={GHOST_BTN}>
          + {noun}
        </button>
      </div>

      {value.length === 0 ? (
        <p className="rounded-md border border-dashed border-rule px-3 py-3 text-[0.82rem] text-ink-soft">
          Empty — this part of the site renders nothing until you add something.
        </p>
      ) : null}

      <ul className="space-y-2">
        {value.map((row, index) => {
          const rowPath = [...path, index]
          const title = rowTitle(row)

          if (primitives) {
            return (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-2.5 w-5 shrink-0 text-right font-mono text-[0.66rem] text-ink-soft/70">
                  {index + 1}
                </span>
                <input
                  type="text"
                  aria-label={`${noun} ${index + 1}`}
                  value={typeof row === 'string' ? row : String(row ?? '')}
                  onChange={(e) => ctx.onChange(rowPath, e.target.value)}
                  className={INPUT}
                />
                <div className="mt-0.5 flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, index - 1)}
                    disabled={index === 0}
                    aria-label={`Move ${noun} ${index + 1} up`}
                    className={GHOST_BTN}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, index + 1)}
                    disabled={index === value.length - 1}
                    aria-label={`Move ${noun} ${index + 1} down`}
                    className={GHOST_BTN}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label={`Remove ${noun} ${index + 1}`}
                    className={GHOST_BTN}
                  >
                    ✕
                  </button>
                </div>
              </li>
            )
          }

          return (
            <li key={index} className="rounded-lg border border-rule bg-card">
              <div className="flex items-center justify-between gap-3 border-b border-rule/70 px-3.5 py-2">
                <p className="min-w-0 font-mono text-[0.66rem] uppercase tracking-[0.13em] text-ink-soft">
                  {noun} {index + 1}
                  {title ? (
                    <span className="ml-2 truncate font-sans text-[0.8rem] normal-case tracking-normal text-ink">
                      {title}
                    </span>
                  ) : null}
                </p>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, index - 1)}
                    disabled={index === 0}
                    aria-label={`Move ${noun} ${index + 1} up`}
                    className={GHOST_BTN}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, index + 1)}
                    disabled={index === value.length - 1}
                    aria-label={`Move ${noun} ${index + 1} down`}
                    className={GHOST_BTN}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label={`Remove ${noun} ${index + 1}`}
                    className={GHOST_BTN}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="space-y-4 px-3.5 py-4">
                <FieldNode value={row} path={rowPath} keyName={keyName} ctx={ctx} depth={depth + 1} />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function ObjectField({
  value,
  path,
  keyName,
  ctx,
  depth,
}: {
  value: Record<string, unknown>
  path: Path
  keyName: string
  ctx: TreeCtx
  depth: number
}) {
  const entries = Object.entries(value).filter(([k]) => !HIDDEN_KEYS.has(k))

  // Rows inside an array already carry a header from ArrayField, and the
  // section root already carries the page title — neither needs a legend.
  const bare = depth === 0 || typeof path[path.length - 1] === 'number'

  const body = (
    <div className="space-y-4">
      {entries.map(([childKey, childValue]) => (
        <FieldNode
          key={childKey}
          value={childValue}
          path={[...path, childKey]}
          keyName={childKey}
          ctx={ctx}
          depth={depth + 1}
        />
      ))}
    </div>
  )

  if (bare) return body

  return (
    <fieldset className="rounded-lg border border-rule bg-paper-deep/35 px-3.5 py-3.5">
      <legend className="px-1 font-mono text-[0.66rem] uppercase tracking-[0.13em] text-ink-soft">
        {humanize(keyName)}
      </legend>
      {body}
    </fieldset>
  )
}

export function FieldNode({
  value,
  path,
  keyName,
  ctx,
  depth = 0,
}: {
  value: unknown
  path: Path
  keyName: string
  ctx: TreeCtx
  depth?: number
}) {
  if (Array.isArray(value)) {
    return <ArrayField value={value} path={path} keyName={keyName} ctx={ctx} depth={depth} />
  }
  if (isPlainObject(value)) {
    return <ObjectField value={value} path={path} keyName={keyName} ctx={ctx} depth={depth} />
  }
  return <LeafField value={value} path={path} keyName={keyName} ctx={ctx} />
}
