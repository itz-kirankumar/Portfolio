import { NextResponse } from 'next/server'
import { safeList, getSingleton } from '@/lib/store'
import { POSTS_COLLECTION, postSchema } from '@/lib/schemas/post'
import { MEDIA_COLLECTION, mediaSchema } from '@/lib/schemas/media'
import { SERVICES_COLLECTION, serviceSchema } from '@/lib/schemas/service'
import { BOOKINGS_COLLECTION, bookingSchema } from '@/lib/schemas/booking'
import { SUBSCRIBERS_COLLECTION, subscriberSchema } from '@/lib/schemas/subscriber'
import { THEME_COLLECTION, THEME_DOC, themeSchema, DEFAULT_THEME } from '@/lib/schemas/theme'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
  // Verify auth manually since API routes don't go through middleware natively unless matched
  const session = (await cookies()).get('__session')
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [posts, media, services, bookings, subscribers, theme] = await Promise.all([
      safeList(POSTS_COLLECTION, postSchema),
      safeList(MEDIA_COLLECTION, mediaSchema),
      safeList(SERVICES_COLLECTION, serviceSchema),
      safeList(BOOKINGS_COLLECTION, bookingSchema),
      safeList(SUBSCRIBERS_COLLECTION, subscriberSchema),
      getSingleton(THEME_COLLECTION, THEME_DOC, themeSchema, DEFAULT_THEME)
    ])

    const data = {
      exportedAt: new Date().toISOString(),
      theme,
      posts,
      media,
      services,
      bookings,
      subscribers
    }

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="portfolio-backup-${new Date().toISOString().split('T')[0]}.json"`
      }
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
