import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAdminDb } from '@/lib/admin'
import { SUBSCRIBERS_COLLECTION } from '@/lib/schemas/subscriber'
import { Resend } from 'resend'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'newsletter@update.com'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy')
    const { subject, html } = await req.json()
    
    const db = getAdminDb()
    const snap = await db.collection(SUBSCRIBERS_COLLECTION).where('active', '==', true).get()
    
    const subscribers = snap.docs.map(doc => doc.data().email as string)
    
    if (subscribers.length === 0) {
      return NextResponse.json({ ok: false, error: 'No active subscribers found.' }, { status: 400 })
    }

    // Resend batch API limit is 100 emails per batch.
    // However, if we just use BCC, we can send to up to 50 recipients per email.
    // To keep it simple and private, we'll send batches using BCC.
    const CHUNK_SIZE = 50
    let sentCount = 0

    for (let i = 0; i < subscribers.length; i += CHUNK_SIZE) {
      const bccChunk = subscribers.slice(i, i + CHUNK_SIZE)
      await resend.emails.send({
        from: `Newsletter <${FROM_EMAIL}>`,
        to: 'undisclosed-recipients@update.com',
        bcc: bccChunk,
        subject,
        html
      })
      sentCount += bccChunk.length
    }

    return NextResponse.json({ 
      ok: true, 
      message: `Successfully broadcasted to ${sentCount} subscribers.` 
    })
  } catch (error: any) {
    console.error('Broadcast failed:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}