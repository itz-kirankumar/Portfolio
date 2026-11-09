'use client'

import React, { useState } from 'react'
import { subscribeToNewsletter } from '@/app/actions/newsletter'

// Inline subscription card. It lives at the end of the writing index and each
// article - no timed overlay, no repeat nags. Readers opt in by choice.
export function NewsletterInline() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  if (status === 'success') {
    return (
      <div className="rounded-xl bg-paper-deep p-6 ring-1 ring-rule sm:p-8">
        <p className="font-display text-lg font-semibold text-ink">You're on the list.</p>
        <p className="mt-2 text-sm text-ink-soft">Thanks for subscribing. I'll be in touch soon.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-paper-deep p-6 ring-1 ring-rule sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-md">
          <h3 className="font-display text-lg font-semibold tracking-[-0.015em] text-ink">
            Get the notes
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
            Occasional emails about what I'm building, what worked, and what broke.
          </p>
        </div>
        <form
          className="flex w-full max-w-sm flex-col gap-2.5 sm:flex-row sm:gap-2"
          action={async (formData) => {
            setStatus('loading')
            const res = await subscribeToNewsletter(formData)
            if (res.error) {
              setStatus('error')
              setMessage(res.error)
            } else {
              setStatus('success')
            }
          }}
        >
          <input
            type="email"
            name="email"
            placeholder="Email address"
            required
            aria-label="Email address"
            className="w-full rounded-md border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="shrink-0 rounded-md bg-coral-deep px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coral-ink disabled:opacity-50"
          >
            {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
          </button>
        </form>
      </div>
      {status === 'error' && <p className="mt-3 text-xs text-red-500">{message}</p>}
    </div>
  )
}
