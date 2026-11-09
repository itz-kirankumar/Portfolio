// Owner-only diagnostics: verifies the connected Google Calendar OAuth token
// can insert events and generate a Meet link. Creates a 5-minute test event
// two weeks out with NO attendees and sendUpdates=none (nothing is emailed),
// reads back the conference data, then deletes the event.

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAdminDb } from '@/lib/admin'
import { AVAILABILITY_COLLECTION, AVAILABILITY_DOC } from '@/lib/schemas/availability'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 403 })
  }

  try {
    const db = getAdminDb()
    const availSnap = await db.collection(AVAILABILITY_COLLECTION).doc(AVAILABILITY_DOC).get()
    const avail = availSnap.exists ? (availSnap.data() as any) : {}
    const tokens: string[] = Object.values(avail?.googleRefreshTokens || {}) as string[]
    if (avail?.googleRefreshToken && !tokens.includes(avail.googleRefreshToken)) {
      tokens.push(avail.googleRefreshToken)
    }
    if (tokens.length === 0) {
      return NextResponse.json({ ok: false, error: 'No Google tokens stored' })
    }

    const { OAuth2Client } = await import('google-auth-library')
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)
    client.setCredentials({ refresh_token: tokens[0] })

    const start = new Date(Date.now() + 14 * 24 * 3600 * 1000)
    const end = new Date(start.getTime() + 5 * 60000)

    const insertRes = await client.request({
      url: 'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=none',
      method: 'POST',
      data: {
        summary: 'calendar-test (auto-deleted)',
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
        conferenceData: {
          createRequest: {
            requestId: `cal-test-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    })

    const event = insertRes.data as any
    const meetLink = event?.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === 'video')?.uri
      || event?.hangoutLink
      || null

    // Clean up immediately
    await client.request({
      url: `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(event.id)}?sendUpdates=none`,
      method: 'DELETE',
    })

    return NextResponse.json({ ok: true, inserted: true, deleted: true, meetLink })
  } catch (err: any) {
    const detail = err?.response?.data || err?.message || String(err)
    return NextResponse.json({ ok: false, error: typeof detail === 'string' ? detail : JSON.stringify(detail) }, { status: 500 })
  }
}
