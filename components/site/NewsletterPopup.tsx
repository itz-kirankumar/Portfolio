'use client'

import React, { useState, useEffect } from 'react'
import { subscribeToNewsletter } from '@/app/actions/newsletter'

export function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Show popup after a delay
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  if (!isOpen) return null

  if (status === 'success') {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-80 rounded-xl bg-paper p-6 shadow-lift ring-1 ring-rule animate-in slide-in-from-bottom-5">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 text-ink-soft hover:text-ink"
        >
          ✕
        </button>
        <p className="font-display text-lg font-semibold text-ink">You're on the list.</p>
        <p className="mt-2 text-sm text-ink-soft">Thanks for subscribing. I'll be in touch soon.</p>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 rounded-xl bg-paper p-6 shadow-lift ring-1 ring-rule animate-in slide-in-from-bottom-5">
      <button 
        onClick={() => setIsOpen(false)}
        className="absolute right-4 top-4 text-ink-soft hover:text-ink"
      >
        ✕
      </button>
      <h3 className="font-display text-lg font-semibold tracking-[-0.015em] text-ink">
        Get the notes
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Occasional emails about what I'm building, what worked, and what broke.
      </p>

      <form 
        className="mt-4 flex flex-col gap-3"
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
          className="w-full rounded-md border border-rule bg-paper-deep px-3 py-2 text-sm text-ink placeholder:text-ink-soft focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral"
        />
        <button 
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded-md bg-coral-deep px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-coral-ink disabled:opacity-50"
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
        {status === 'error' && (
          <p className="text-xs text-red-500">{message}</p>
        )}
      </form>
    </div>
  )
}
