'use client'

// Row-level quick actions for admin lists: publish/unpublish in one click,
// view-live link, and a confirmed delete. Every action reports its outcome
// through the toast store - a silent failure reads exactly like success, so
// nothing here swallows an error.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink, Globe, Undo2, Trash2, Loader2 } from 'lucide-react'
import { Modal } from './ui'
import { useUI as useToast } from '@/lib/store/ui'

type ActionResult = { success?: boolean; ok?: boolean; error?: string }

const ICON_BTN =
  'inline-flex size-8 items-center justify-center rounded-md text-ink-soft transition hover:bg-paper-deep hover:text-ink disabled:opacity-40 disabled:pointer-events-none'

export function ListItemActions({
  kindLabel,
  title,
  status,
  liveHref,
  onToggleStatus,
  onDelete,
}: {
  /** "post" | "page" | "work" - used in confirmations and toasts. */
  kindLabel: string
  title: string
  /** Current status; the toggle shows only for draft/published pairs. */
  status: string
  /** Public URL when the item is live. Omit to hide the view link. */
  liveHref?: string
  /** Bound server action flipping draft <-> published. Omit to hide the toggle. */
  onToggleStatus?: () => Promise<ActionResult>
  /** Bound server action deleting the item. */
  onDelete: () => Promise<ActionResult>
}) {
  const router = useRouter()
  const [busy, setBusy] = useState<'toggle' | 'delete' | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isPublished = status === 'published'
  const canToggle = !!onToggleStatus && (isPublished || status === 'draft')

  async function runToggle() {
    if (!onToggleStatus || busy) return
    setBusy('toggle')
    try {
      const result = await onToggleStatus()
      if (result.success || result.ok) {
        useToast.getState().toast(isPublished ? `"${title}" moved back to drafts` : `"${title}" is now live`)
        router.refresh()
      } else {
        useToast.getState().toast(result.error || `Could not update this ${kindLabel}.`, 'error')
      }
    } catch {
      useToast.getState().toast(`Could not update this ${kindLabel} - the request never completed. Retry.`, 'error')
    } finally {
      setBusy(null)
    }
  }

  async function runDelete() {
    if (busy) return
    setBusy('delete')
    try {
      const result = await onDelete()
      if (result.success || result.ok) {
        setConfirmDelete(false)
        useToast.getState().toast(`"${title}" deleted`)
        router.refresh()
      } else {
        useToast.getState().toast(result.error || `Could not delete this ${kindLabel}.`, 'error')
      }
    } catch {
      useToast.getState().toast(`Could not delete this ${kindLabel} - the request never completed. Retry.`, 'error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      {liveHref && (
        <a
          href={liveHref}
          target="_blank"
          rel="noreferrer"
          className={ICON_BTN}
          title={`View live ${kindLabel}`}
          aria-label={`View live ${kindLabel}`}
        >
          <ExternalLink className="size-4" />
        </a>
      )}
      {canToggle && (
        <button
          type="button"
          onClick={runToggle}
          disabled={busy !== null}
          className={ICON_BTN}
          title={isPublished ? 'Unpublish (back to draft)' : 'Publish now'}
          aria-label={isPublished ? `Unpublish ${title}` : `Publish ${title}`}
        >
          {busy === 'toggle' ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isPublished ? (
            <Undo2 className="size-4" />
          ) : (
            <Globe className="size-4" />
          )}
        </button>
      )}
      <button
        type="button"
        onClick={() => setConfirmDelete(true)}
        disabled={busy !== null}
        className={`${ICON_BTN} hover:text-red-500 hover:bg-red-500/10`}
        title={`Delete this ${kindLabel}…`}
        aria-label={`Delete ${title}`}
      >
        <Trash2 className="size-4" />
      </button>

      <Modal
        open={confirmDelete}
        onClose={() => (busy ? null : setConfirmDelete(false))}
        title={`Delete "${title}"?`}
        description={`This permanently removes the ${kindLabel} and its public URL. This cannot be undone.`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              disabled={busy !== null}
              className="rounded-lg px-4 py-2 text-[0.88rem] font-medium text-ink-soft transition hover:text-ink disabled:opacity-50"
            >
              Keep it
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={runDelete}
              className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-[0.88rem] font-medium text-white transition hover:bg-red-400 disabled:opacity-50"
            >
              {busy === 'delete' && <Loader2 className="size-3.5 animate-spin" />}
              {busy === 'delete' ? 'Deleting…' : 'Delete permanently'}
            </button>
          </>
        }
      >
        <p className="text-[0.9rem] text-ink-soft">
          The {kindLabel} is removed from the site immediately. Other items are not affected.
        </p>
      </Modal>
    </div>
  )
}
