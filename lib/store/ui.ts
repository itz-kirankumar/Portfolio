// lib/store/ui.ts
//
// Client-only UI state. Deliberately small: this is NOT a data cache. Anything
// that lives in Firestore is fetched on the server and mutated through Server
// Actions with useTransition — putting it here too would give us two copies of
// the truth and a stale-data bug to find later.
//
// Sidebar collapse is NOT here either. It is a cookie read by app/admin/layout.tsx
// on the server, because /admin is already dynamic (it resolves a session), so
// the server can render the correct width on the first paint. localStorage would
// mean rendering the wrong width and correcting it after hydration.

import { create } from 'zustand'

export type ToastTone = 'ok' | 'error' | 'info'

export interface Toast {
  id: number
  message: string
  tone: ToastTone
  /** Optional second line — validation issues, a failure reason. */
  detail?: string
}

interface UIState {
  toasts: Toast[]
  toast: (message: string, tone?: ToastTone, detail?: string) => number
  dismiss: (id: number) => void
}

/** Monotonic, so a React key is never reused after a fast dismiss/re-add. */
let nextId = 1

/** How long a toast survives. Errors linger — you may need to read them twice. */
const LIFETIME: Record<ToastTone, number> = { ok: 2600, info: 3600, error: 8000 }

export const useUI = create<UIState>((set, get) => ({
  toasts: [],

  toast(message, tone = 'ok', detail) {
    const id = nextId++
    set((state) => ({ toasts: [...state.toasts, { id, message, tone, detail }] }))
    setTimeout(() => get().dismiss(id), LIFETIME[tone])
    return id
  },

  dismiss(id) {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
}))

/** Reading the action alone, so a component that only fires toasts never re-renders on one. */
export const useToast = () => useUI((s) => s.toast)
