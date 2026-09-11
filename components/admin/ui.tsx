'use client'
// components/admin/ui.tsx
//
// The admin's shared vocabulary. Everything here speaks the same paper-desk
// language as the public site — same tokens, same mono eyebrows, same rules —
// because an admin that looks like a different product is one you trust less.
//
// Dialogs use the native <dialog> element. `showModal()` gives a focus trap,
// Escape-to-close, inert background and a ::backdrop for free; hand-rolling
// those is ~80 lines of listener code that is usually subtly wrong.

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type SelectHTMLAttributes,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUI } from '@/lib/store/ui'

/* ───────────────────────────────────────────────────────── class constants ── */

/** Shared by every text control, including FieldTree's generated ones. */
export const INPUT =
  'w-full rounded-md border border-rule bg-card px-3 py-2 text-[0.92rem] leading-relaxed text-ink placeholder:text-ink-soft/50 outline-none transition focus:border-coral-ink focus:ring-2 focus:ring-coral/20'

export const GHOST_BTN =
  'rounded-md border border-rule bg-card px-2 py-1 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-ink-soft transition hover:border-ink-soft hover:text-ink disabled:cursor-not-allowed disabled:opacity-35'

export const BTN =
  'inline-flex items-center justify-center gap-1.5 rounded-md border border-rule bg-card px-3 py-2 text-[0.85rem] font-medium text-ink transition hover:border-ink-soft hover:bg-paper-deep disabled:cursor-not-allowed disabled:opacity-40'

export const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-1.5 rounded-md border border-coral-deep bg-coral-deep px-3.5 py-2 text-[0.85rem] font-medium text-white transition hover:bg-coral disabled:cursor-not-allowed disabled:opacity-40'

export const LABEL = 'block font-mono text-[0.66rem] uppercase tracking-[0.13em] text-ink-soft'

/* ────────────────────────────────────────────────────────────── containers ── */

export function Panel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-xl border border-rule bg-card', className)}>
      {title || actions ? (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-rule/70 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 className="font-display text-[1.02rem] font-semibold tracking-[-0.01em] text-ink">
              {title}
            </h2>
            {description ? (
              <p className="mt-0.5 text-[0.82rem] leading-snug text-ink-soft">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className="px-4 py-4 sm:px-5 sm:py-5">{children}</div>
    </section>
  )
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-[1.7rem] font-semibold leading-tight tracking-[-0.02em] text-ink">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-prose text-[0.9rem] leading-relaxed text-ink-soft">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  )
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string
  description?: string
  action?: ReactNode
  /**
   * An *element*, not a component type. Server components render these, and a
   * function prop cannot cross the server/client boundary — lucide-react has no
   * 'use client', so `icon={Inbox}` would throw where `icon={<Inbox />}` works.
   */
  icon?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2.5 rounded-lg border border-dashed border-rule px-6 py-12 text-center">
      {icon ? <span className="text-ink-soft/60 [&>svg]:size-6">{icon}</span> : null}
      <p className="font-display text-[1rem] font-semibold text-ink">{title}</p>
      {description ? (
        <p className="max-w-sm text-[0.85rem] leading-relaxed text-ink-soft">{description}</p>
      ) : null}
      {action ? <div className="mt-1.5">{action}</div> : null}
    </div>
  )
}

export function StatCard({
  label,
  value,
  hint,
  href,
  tone = 'default',
}: {
  label: string
  value: ReactNode
  hint?: string
  href?: string
  /** `muted` is for a stat we genuinely cannot measure — see the dashboard. */
  tone?: 'default' | 'muted' | 'accent'
}) {
  const body = (
    <>
      <p className={LABEL}>{label}</p>
      <p
        className={cn(
          'mt-1.5 font-display text-[1.75rem] font-semibold leading-none tracking-[-0.02em]',
          tone === 'muted' ? 'text-ink-soft/60' : tone === 'accent' ? 'text-coral-ink' : 'text-ink'
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-[0.78rem] leading-snug text-ink-soft">{hint}</p> : null}
    </>
  )

  const className = cn(
    'block rounded-xl border border-rule bg-card px-4 py-3.5 transition',
    href && 'hover:border-ink-soft/60 hover:bg-paper-deep/40'
  )

  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  )
}

/* ──────────────────────────────────────────────────────────────── controls ── */

export function Field({
  label,
  help,
  error,
  htmlFor,
  children,
}: {
  label: ReactNode
  help?: ReactNode
  error?: string | null
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className={LABEL}>
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-[0.78rem] leading-snug text-coral-ink">
          {error}
        </p>
      ) : help ? (
        <p className="text-[0.78rem] leading-snug text-ink-soft/85">{help}</p>
      ) : null}
    </div>
  )
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={cn(INPUT, className)} />
}

export function Textarea({ className, rows = 3, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} rows={rows} className={cn(INPUT, 'resize-y', className)} />
}

export function Select({
  className,
  options,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & {
  /** Convenience for the common case; pass `children` instead for grouped options. */
  options?: readonly { value: string; label: string }[]
}) {
  return (
    <select {...rest} className={cn(INPUT, className)}>
      {options
        ? options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))
        : children}
    </select>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  help,
  disabled,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: ReactNode
  help?: ReactNode
  disabled?: boolean
}) {
  const id = useId()
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-40',
          checked ? 'border-coral-deep bg-coral-deep' : 'border-rule bg-paper-deep'
        )}
      >
        <span
          className={cn(
            'ml-0.5 size-3.5 rounded-full bg-card shadow-sm transition-transform',
            checked && 'translate-x-4'
          )}
        />
      </button>
      <div className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-[0.88rem] font-medium text-ink">
          {label}
        </label>
        {help ? <p className="text-[0.78rem] leading-snug text-ink-soft">{help}</p> : null}
      </div>
    </div>
  )
}

export function Tabs<T extends string>({
  value,
  onChange,
  tabs,
}: {
  value: T
  onChange: (next: T) => void
  tabs: readonly { value: T; label: string; count?: number }[]
}) {
  return (
    <div role="tablist" className="flex flex-wrap gap-1 border-b border-rule">
      {tabs.map((tab) => {
        const active = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              '-mb-px border-b-2 px-3 py-2 text-[0.85rem] font-medium transition',
              active
                ? 'border-coral-deep text-ink'
                : 'border-transparent text-ink-soft hover:text-ink'
            )}
          >
            {tab.label}
            {typeof tab.count === 'number' ? (
              <span className="ml-1.5 font-mono text-[0.7rem] text-ink-soft/70">{tab.count}</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────── dialogs ── */

function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  // Escape fires `cancel`/`close` on the element itself, so state must follow it
  // or the dialog closes visually while the parent still thinks it is open.
  const handleClose = useCallback(() => onClose(), [onClose])

  return { ref, handleClose }
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}) {
  const { ref, handleClose } = useDialog(open, onClose)

  return (
    <dialog
      ref={ref}
      onClose={handleClose}
      className={cn(
        'w-[min(92vw,34rem)] rounded-xl border border-rule bg-card p-0 text-ink backdrop:bg-slate-deep/45 backdrop:backdrop-blur-sm',
        wide && 'w-[min(94vw,56rem)]'
      )}
    >
      <header className="flex items-start justify-between gap-3 border-b border-rule/70 px-5 py-3.5">
        <div className="min-w-0">
          <h2 className="font-display text-[1.05rem] font-semibold tracking-[-0.01em]">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-[0.82rem] leading-snug text-ink-soft">{description}</p>
          ) : null}
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className={GHOST_BTN}>
          <X className="size-3.5" />
        </button>
      </header>

      <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>

      {footer ? (
        <footer className="flex justify-end gap-2 border-t border-rule/70 px-5 py-3">{footer}</footer>
      ) : null}
    </dialog>
  )
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  const { ref, handleClose } = useDialog(open, onClose)

  return (
    <dialog
      ref={ref}
      onClose={handleClose}
      // `mr-0 ml-auto h-full max-h-full` is what turns a centred dialog into a
      // right-hand slide-over without leaving the native element behind.
      className="ml-auto mr-0 h-full max-h-full w-[min(94vw,30rem)] rounded-none border-l border-rule bg-card p-0 text-ink backdrop:bg-slate-deep/45 backdrop:backdrop-blur-sm"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-rule/70 px-5 py-3.5">
          <div className="min-w-0">
            <h2 className="truncate font-display text-[1.05rem] font-semibold tracking-[-0.01em]">
              {title}
            </h2>
            {description ? (
              <p className="mt-0.5 text-[0.82rem] leading-snug text-ink-soft">{description}</p>
            ) : null}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className={GHOST_BTN}>
            <X className="size-3.5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer ? (
          <footer className="flex justify-end gap-2 border-t border-rule/70 px-5 py-3">
            {footer}
          </footer>
        ) : null}
      </div>
    </dialog>
  )
}

/* ──────────────────────────────────────────────────────────────────── save ── */

export function SaveBar({
  dirty,
  saving,
  onSave,
  onReset,
  savedAt,
  error,
  issues,
}: {
  dirty: boolean
  saving: boolean
  onSave: () => void
  onReset?: () => void
  savedAt?: number | null
  error?: string | null
  issues?: string[]
}) {
  // Ctrl/Cmd-S is muscle memory for anyone who has ever used a CMS. Without it,
  // the browser's own save-page dialog appears, which is worse than nothing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        if (dirty && !saving) onSave()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dirty, saving, onSave])

  // Closing the tab mid-edit should cost a confirm, not the edit.
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  return (
    <div className="sticky bottom-0 z-20 -mx-1 mt-6 border-t border-rule bg-paper/92 px-1 py-3 backdrop-blur-md">
      {error ? (
        <div
          role="alert"
          className="mb-2.5 rounded-md border border-coral-ink/40 bg-coral-soft/60 px-3 py-2.5"
        >
          <p className="text-[0.85rem] font-medium text-coral-ink">{error}</p>
          {issues?.length ? (
            <ul className="mt-1 space-y-0.5">
              {issues.map((issue) => (
                <li key={issue} className="font-mono text-[0.72rem] leading-snug text-coral-ink/90">
                  {issue}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.13em] text-ink-soft">
          {saving
            ? 'Saving…'
            : dirty
              ? 'Unsaved changes'
              : savedAt
                ? `Saved ${new Date(savedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
                : 'Up to date'}
        </p>

        <div className="flex items-center gap-2">
          {onReset ? (
            <button type="button" onClick={onReset} disabled={!dirty || saving} className={BTN}>
              Discard
            </button>
          ) : null}
          <button type="button" onClick={onSave} disabled={!dirty || saving} className={BTN_PRIMARY}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────── toaster ── */

const TOAST_ICON = { ok: CheckCircle2, error: AlertCircle, info: Info } as const

export function Toaster() {
  const toasts = useUI((s) => s.toasts)
  const dismiss = useUI((s) => s.dismiss)

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(92vw,22rem)] flex-col gap-2"
    >
      {toasts.map((t) => {
        const Icon = TOAST_ICON[t.tone]
        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-2.5 rounded-lg border bg-card px-3.5 py-2.5 shadow-lg',
              t.tone === 'error' ? 'border-coral-ink/50' : 'border-rule'
            )}
          >
            <Icon
              className={cn(
                'mt-0.5 size-4 shrink-0',
                t.tone === 'error' ? 'text-coral-ink' : t.tone === 'ok' ? 'text-ink' : 'text-ink-soft'
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[0.85rem] font-medium leading-snug text-ink">{t.message}</p>
              {t.detail ? (
                <p className="mt-0.5 whitespace-pre-line text-[0.76rem] leading-snug text-ink-soft">
                  {t.detail}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="shrink-0 text-ink-soft/70 transition hover:text-ink"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
