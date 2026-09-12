'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Resend } from 'resend'
import { safeList } from '@/lib/store'
import { SUBSCRIBERS_COLLECTION, subscriberSchema } from '@/lib/schemas/subscriber'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendNewsletter(subject: string, html: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) {
    return { ok: false, error: 'Not authorised.' }
  }

  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: 'RESEND_API_KEY is not configured.' }
  }

  try {
    const subscribers = await safeList(SUBSCRIBERS_COLLECTION, subscriberSchema, {
      where: [['status', '==', 'active']]
    })

    if (subscribers.length === 0) {
      return { ok: false, error: 'No active subscribers found.' }
    }

    const BATCH_SIZE = 100
    let count = 0

    // Send in batches of 100 (Resend batch API limit)
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE)
      
      const payload = batch.map(sub => ({
        from: `Newsletter <${process.env.RESEND_FROM_EMAIL || 'newsletter@kirankumarg.com'}>`,
        to: [sub.email],
        subject: subject,
        html: html,
      }))

      await resend.batch.send(payload)
      count += batch.length
    }

    return { ok: true, count }
  } catch (error: any) {
    console.error('Newsletter send error:', error)
    return { ok: false, error: error.message || 'Failed to send newsletter.' }
  }
}
