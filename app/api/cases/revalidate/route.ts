import { revalidatePath } from 'next/cache'
import { timingSafeEqual } from 'node:crypto'

export const dynamic = 'force-dynamic'

// Called by scripts/publish-case.mjs after a swap so the home page picks up the new version right away.
export async function POST(req: Request) {
  const want = process.env.CASES_REVALIDATE_TOKEN || ''
  const got = req.headers.get('x-cases-token') || ''
  const ok = want.length >= 32 && got.length === want.length && timingSafeEqual(Buffer.from(got), Buffer.from(want))
  if (!ok) return new Response('Forbidden', { status: 403 })
  revalidatePath('/')
  return Response.json({ ok: true })
}
