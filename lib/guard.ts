// lib/guard.ts
//
// The single place an admin mutation checks that it is the owner talking.
//
// Every Server Action and Route Handler calls this itself. The gate in
// app/admin/layout.tsx is a UX affordance only — Server Actions POST to the
// page route and Route Handlers have no layout at all, so a layout-level check
// protects nothing.

import { getServerSession } from 'next-auth'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'

export class NotOwnerError extends Error {
  constructor() {
    super('Not authorised.')
    this.name = 'NotOwnerError'
  }
}

/** The session if the caller owns this site, otherwise null. */
export async function getOwnerSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions)
  return session?.user?.isOwner ? session : null
}

export async function isOwner(): Promise<boolean> {
  return (await getOwnerSession()) !== null
}

/**
 * Throws `NotOwnerError` when the caller is not the owner. Server Actions
 * should catch it and return a result object; Route Handlers should map it to
 * a 403 (see `forbidden()` below).
 */
export async function requireOwner(): Promise<Session> {
  const session = await getOwnerSession()
  if (!session) throw new NotOwnerError()
  return session
}
