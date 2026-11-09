'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
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
          data-clarity-mask="true"
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

// Timed popup on reading routes only (/writing, /p/...). At most once per day,
// and once a reader cancels or subscribes it never shows again on this browser.
export function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const pathname = usePathname()

  const allowed = pathname.startsWith('/writing') || pathname.startsWith('/p/')

  useEffect(() => {
    if (!allowed) return
    try {
      if (localStorage.getItem('newsletter-quiet')) return
      const last = Number(localStorage.getItem('newsletter-last-shown') || 0)
      if (Date.now() - last < 24 * 3600 * 1000) return
      const timer = setTimeout(() => {
        try {
          localStorage.setItem('newsletter-last-shown', String(Date.now()))
        } catch {}
        setIsOpen(true)
      }, 8000)
      return () => clearTimeout(timer)
    } catch {}
  }, [allowed])

  if (!isOpen || !allowed) return null

  const quiet = () => {
    try {
      localStorage.setItem('newsletter-quiet', '1')
    } catch {}
    setIsOpen(false)
  }

  if (status === 'success') {
    return (
      <div className="newsletter-popup fixed bottom-6 left-4 z-50 w-[calc(100vw-7rem)] max-w-80 sm:left-6 rounded-xl bg-paper p-6 shadow-lift ring-1 ring-rule animate-in slide-in-from-bottom-5">
        <button onClick={quiet} className="absolute right-4 top-4 text-ink-soft hover:text-ink" aria-label="Close">✕</button>
        <p className="font-display text-lg font-semibold text-ink">You're on the list.</p>
        <p className="mt-2 text-sm text-ink-soft">Thanks for subscribing. I'll be in touch soon.</p>
      </div>
    )
  }

  return (
    <div className="newsletter-popup fixed bottom-6 left-4 z-50 w-[calc(100vw-7rem)] max-w-80 sm:left-6 rounded-xl bg-paper p-6 shadow-lift ring-1 ring-rule animate-in slide-in-from-bottom-5">
      <button onClick={quiet} className="absolute right-4 top-4 text-ink-soft hover:text-ink" aria-label="Close">✕</button>
      <h3 className="font-display text-lg font-semibold tracking-[-0.015em] text-ink">Get the notes</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Occasional emails about what I'm building, what worked, and what broke.
      </p>
      <form
        data-clarity-mask="true"
        className="mt-4 flex flex-col gap-3"
        action={async (formData) => {
          setStatus('loading')
          const res = await subscribeToNewsletter(formData)
          if (res.error) {
            setStatus('error')
            setMessage(res.error)
          } else {
            setStatus('success')
            try {
              localStorage.setItem('newsletter-quiet', '1')
            } catch {}
          }
        }}
      >
        <input
          type="email"
          name="email"
          placeholder="Email address"
          required
          aria-label="Email address"
          className="w-full rounded-md border border-rule bg-paper-deep px-3 py-2 text-sm text-ink placeholder:text-ink-soft focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded-md bg-coral-deep px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-coral-ink disabled:opacity-50"
        >
          {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
        </button>
        {status === 'error' && <p className="text-xs text-red-500">{message}</p>}
      </form>
    </div>
  )
}
