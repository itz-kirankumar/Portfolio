import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAdminDb } from '@/lib/admin'
import { cleanPath, EVENT_NAMES } from '@/lib/analytics-policy'
import { z } from 'zod'
import { createHash } from 'crypto'

const payload = z.object({
  name: z.enum(EVENT_NAMES), path: z.string().max(220), sessionId: z.string().uuid(),
  props: z.object({ target: z.string().max(220).optional(), referrer: z.string().max(100).optional(), percent: z.number().min(0).max(100).optional(), seconds: z.number().min(0).max(300).optional() }).strict().default({}),
})
const rate = new Map<string, { count: number; start: number }>()
export async function POST(req: Request) {
  try {
    const origin = req.headers.get('origin')
    if (!origin || !['https://kirankumarg.me', 'https://www.kirankumarg.me', ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:3000'] : [])].includes(origin)) return NextResponse.json({ ok: false }, { status: 403 })
    if (Number(req.headers.get('content-length') || 0) > 2048) return NextResponse.json({ ok: false }, { status: 413 })
    const ua = req.headers.get('user-agent') || ''
    const session = await getServerSession(authOptions)
    if (session?.user?.isOwner || /bot|spider|crawl|headless|playwright/i.test(ua)) return NextResponse.json({ ok: true, ignored: true })
    // Ephemeral, salted-in-process IP hash for abuse limiting. No IP is stored.
    const bucket = createHash('sha256').update(req.headers.get('x-forwarded-for') || 'unknown').digest('hex')
    const now = Date.now()
    if (rate.size > 10000) rate.clear()
    const r = rate.get(bucket)
    if (r && now - r.start < 60000 && r.count >= 90) return NextResponse.json({ ok: false }, { status: 429 })
    rate.set(bucket, r && now - r.start < 60000 ? { ...r, count: r.count + 1 } : { count: 1, start: now })
    const parsed = payload.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 })
    const event = parsed.data
    const path = cleanPath(event.path)
    if (!path) return NextResponse.json({ ok: true, ignored: true })
    // Only paths and hostnames are allowed, never query strings, names or emails.
    if (event.props.target) event.props.target = event.props.target.split(/[?#]/)[0]
    await getAdminDb().collection('portfolioEvents').add({ ...event, path, timestamp: now, version: 1 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
