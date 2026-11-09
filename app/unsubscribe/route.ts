import { NextResponse } from 'next/server'
import { safeList, putDoc } from '@/lib/store'
import { SUBSCRIBERS_COLLECTION, subscriberSchema } from '@/lib/schemas/subscriber'

const PAGE = (message: string) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Unsubscribe - Kiran Kumar G</title>
<meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family:Georgia,serif;background:#faf6ef;color:#292524;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0">
<main style="max-width:34rem;padding:2rem;text-align:center">
<h1 style="font-size:1.4rem">Newsletter preferences</h1>
<p>${message}</p>
<p><a href="https://kirankumarg.me" style="color:#c2410c">Back to kirankumarg.me</a></p>
</main></body></html>`

/**
 * One-click unsubscribe. The answer is deliberately identical whether the
 * token matches a subscriber or not - the page must never reveal which
 * tokens exist.
 */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token') || ''

  if (token) {
    try {
      const matches = await safeList(SUBSCRIBERS_COLLECTION, subscriberSchema, {
        where: [['token', '==', token]],
        limit: 1,
      })
      const sub = matches[0]
      if (sub && sub.status !== 'unsubscribed') {
        await putDoc(SUBSCRIBERS_COLLECTION, sub.id, subscriberSchema, {
          ...sub,
          status: 'unsubscribed',
          unsubscribedAt: Date.now(),
        })
      }
    } catch (err) {
      console.error('Unsubscribe failed:', err)
      return new NextResponse(
        PAGE('Something went wrong on our side. Please try the link again in a minute.'),
        { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }
  }

  return new NextResponse(
    PAGE("You're unsubscribed. You won't get the newsletter again. If this was a mistake, subscribe again on the site."),
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}
