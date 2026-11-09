// lib/calendar-scope.ts
//
// Health check for paid booking fulfilment. A confirmed booking promises a
// Google Meet invite by email; that only works while the stored OAuth token
// carries the calendar.events scope. Until it does, paid checkout must stay
// closed rather than collect money against a promise we cannot keep.

import { getAdminDb } from '@/lib/admin'
import { AVAILABILITY_COLLECTION, AVAILABILITY_DOC } from '@/lib/schemas/availability'

export async function hasCalendarWriteScope(): Promise<boolean> {
  try {
    const db = getAdminDb()
    const snap = await db.collection(AVAILABILITY_COLLECTION).doc(AVAILABILITY_DOC).get()
    const avail = snap.exists ? (snap.data() as any) : {}
    const tokens: string[] = Object.values(avail?.googleRefreshTokens || {}) as string[]
    if (avail?.googleRefreshToken && !tokens.includes(avail.googleRefreshToken)) {
      tokens.push(avail.googleRefreshToken)
    }
    if (tokens.length === 0) return false

    const { OAuth2Client } = await import('google-auth-library')
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)
    client.setCredentials({ refresh_token: tokens[0] })
    const { token } = await client.getAccessToken()
    if (!token) return false

    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(token)}`)
    if (!res.ok) return false
    const info = (await res.json()) as { scope?: string }
    return (info.scope || '').split(' ').includes('https://www.googleapis.com/auth/calendar.events')
  } catch {
    return false
  }
}
