'use client'
// components/admin/SignOutButton.tsx
//
// `signOut` fetches its own CSRF token, so this works without a
// SessionProvider — which is why the root layout no longer ships one.

import { signOut } from 'next-auth/react'
import { useState } from 'react'

export default function SignOutButton() {
  const [busy, setBusy] = useState(false)

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => {
        setBusy(true)
        void signOut({ callbackUrl: '/' })
      }}
      className="rounded-md px-2.5 py-1.5 text-ink-soft transition hover:bg-paper-deep hover:text-ink disabled:opacity-50"
    >
      {busy ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
