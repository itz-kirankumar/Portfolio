import { readCasePage } from '@/lib/cases'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string; page: string }> }) {
  const { slug, page } = await params
  try {
    const img = await readCasePage(slug, Number(page))
    if (!img) return new Response('Not found', { status: 404 })
    return new Response(new Uint8Array(img), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': 'inline',
        'Cache-Control': 'private, no-store, max-age=0',
        'X-Robots-Tag': 'noindex, noimageindex',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (err) {
    console.error('[cases] page failed:', err)
    return new Response('Unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
