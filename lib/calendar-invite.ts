// lib/calendar-invite.ts
//
// Sends the real calendar invite after a booking is confirmed. Uses the same
// Google OAuth refresh token(s) the owner connected for availability sync.
// The invite carries a Google Meet link and Google's own email delivery to the
// guest, so the "you will get the call details on email" promise is backed by
// Google Calendar, not by a separate mail provider.
//
// Failure here must never break a payment confirmation: callers wrap this in
// try/catch and the booking stays confirmed either way.

import { getAdminDb } from '@/lib/admin'
import { AVAILABILITY_COLLECTION, AVAILABILITY_DOC } from '@/lib/schemas/availability'

export async function sendBookingInvite(params: {
  bookingId: string
  serviceTitle: string
  guestName: string
  guestEmail: string
  notes?: string
  startISO: string
  endISO: string
}): Promise<{ ok: boolean; meetLink?: string; eventId?: string; error?: string }> {
  try {
    const db = getAdminDb()
    const availSnap = await db.collection(AVAILABILITY_COLLECTION).doc(AVAILABILITY_DOC).get()
    const avail = availSnap.exists ? (availSnap.data() as any) : {}

    const tokens: string[] = Object.values(avail?.googleRefreshTokens || {}) as string[]
    if (avail?.googleRefreshToken && !tokens.includes(avail.googleRefreshToken)) {
      tokens.push(avail.googleRefreshToken)
    }
    if (tokens.length === 0) {
      return { ok: false, error: 'No Google Calendar connection configured' }
    }

    const { OAuth2Client } = await import('google-auth-library')
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)
    client.setCredentials({ refresh_token: tokens[0] })

    const requestId = `booking-${params.bookingId}`.replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 60)

    const res = await client.request({
      url: 'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all',
      method: 'POST',
      data: {
        summary: `${params.serviceTitle} - ${params.guestName}`,
        description:
          `1:1 call booked via kirankumarg.me.\n\n` +
          (params.notes ? `What ${params.guestName} wants to cover:\n${params.notes}\n\n` : '') +
          `Booking ref: ${params.bookingId}`,
        start: { dateTime: params.startISO },
        end: { dateTime: params.endISO },
        attendees: [{ email: params.guestEmail, displayName: params.guestName }],
        conferenceData: {
          createRequest: {
            requestId,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 },
          ],
        },
      },
    })

    const event = res.data as any
    const meetLink = event?.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === 'video')?.uri
      || event?.hangoutLink
      || undefined

    return { ok: true, meetLink, eventId: event?.id }
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) }
  }
}
