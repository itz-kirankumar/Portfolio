'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Resend } from 'resend'
import { safeList } from '@/lib/store'
import { SUBSCRIBERS_COLLECTION, subscriberSchema } from '@/lib/schemas/subscriber'
import { personalize, sendBatches } from '@/lib/newsletter'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendNewsletter(subject: string, html: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) {
    return { ok: false, error: 'Not authorised.' }
  }

  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: 'RESEND_API_KEY is not configured.' }
  }

  // Marketing email must carry the sender's postal address. It is read from
  // config, never invented: without it the send stays closed.
  const postalAddress = (process.env.NEWSLETTER_POSTAL_ADDRESS || '').trim()
  if (!postalAddress) {
    return { ok: false, error: 'NEWSLETTER_POSTAL_ADDRESS is not configured; the law requires a postal address in marketing email.' }
  }

  try {
    const subscribers = await safeList(SUBSCRIBERS_COLLECTION, subscriberSchema, {
      where: [['status', '==', 'active']]
    })

    if (subscribers.length === 0) {
      return { ok: false, error: 'No active subscribers found.' }
    }

    // Every recipient needs their own unsubscribe token. Rows predating
    // tokens must not receive mail without one; backfilling them touches
    // subscriber data and needs a separate owner decision.
    const tokenless = subscribers.filter((s) => !s.token).length
    if (tokenless > 0) {
      return {
        ok: false,
        error: `${tokenless} active subscriber${tokenless === 1 ? '' : 's'} predate unsubscribe tokens. Sending is blocked until their tokens are backfilled.`,
      }
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://kirankumarg.me').replace(/\/$/, '')
    const fromAddress = `Newsletter <${process.env.RESEND_FROM_EMAIL || 'newsletter@kirankumarg.com'}>`

    const BATCH_SIZE = 100
    const batches: unknown[][] = []
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      batches.push(
        subscribers.slice(i, i + BATCH_SIZE).map((sub) => ({
          from: fromAddress,
          to: [sub.email],
          subject,
          html: personalize(html, sub.token, siteUrl, postalAddress),
        }))
      )
    }

    const result = await sendBatches(resend, batches)
    if (result.error) {
      return {
        ok: false,
        error: `Send failed after ${result.sent} delivered: ${result.error}`,
        sent: result.sent,
        failed: result.failed,
      }
    }

    return { ok: true, count: result.sent }
  } catch (error: any) {
    console.error('Newsletter send error:', error)
    return { ok: false, error: error.message || 'Failed to send newsletter.' }
  }
}
