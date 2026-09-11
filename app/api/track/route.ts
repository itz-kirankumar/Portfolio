import { NextResponse } from 'next/server'
import { createStrict } from '@/lib/store'
import { ANALYTICS_COLLECTION, analyticsSchema } from '@/lib/schemas/analytics'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const path = body.path || '/'
    const referrer = body.referrer || ''
    
    const userAgent = req.headers.get('user-agent') || ''
    // Basic bot filtering
    if (userAgent.toLowerCase().includes('bot') || userAgent.toLowerCase().includes('spider')) {
      return NextResponse.json({ ok: true, status: 'ignored' })
    }

    const id = crypto.randomUUID()
    await createStrict(ANALYTICS_COLLECTION, id, analyticsSchema, {
      path,
      referrer,
      userAgent,
      timestamp: Date.now(),
      sessionId: 'anon' // We can expand this with simple fingerprinting if needed
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Failed to track analytics:', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
