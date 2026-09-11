import { NextResponse, type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = req.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 })
  }

  try {
    let platform = 'other'
    if (url.includes('youtube.com') || url.includes('youtu.be')) platform = 'youtube'
    else if (url.includes('instagram.com')) platform = 'instagram'
    else if (url.includes('linkedin.com')) platform = 'linkedin'
    else if (url.includes('twitter.com') || url.includes('x.com')) platform = 'x'
    else if (url.includes('tiktok.com')) platform = 'tiktok'
    else if (url.includes('facebook.com')) platform = 'facebook'
    else if (url.includes('pinterest.com')) platform = 'pinterest'
    else if (url.includes('github.com')) platform = 'github'
    else if (url.includes('maps.google.com') || url.includes('goo.gl/maps')) platform = 'map'

    // We can do a lightweight OpenGraph fetch using fetch() and regex, or rely on an external service.
    // For simplicity, we fetch the HTML and regex out the og:title, og:image, og:description
    const htmlRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
    })
    
    if (!htmlRes.ok) {
       return NextResponse.json({ platform, url, title: url, thumbUrl: '' })
    }

    const html = await htmlRes.text()
    
    const getOg = (prop: string) => {
      const match = html.match(new RegExp(`<meta(?:\\s+[^>]*?)?(?:property|name)=["'](?:og:|twitter:)?${prop}["']\\s+content=["'](.*?)["']`, 'i'))
      return match ? match[1] : null
    }

    let title = getOg('title') || getOg('title') 
    if (!title) {
      const titleMatch = html.match(/<title>(.*?)<\/title>/i)
      title = titleMatch ? titleMatch[1] : url
    }

    const thumbUrl = getOg('image') || ''
    const authorName = getOg('site_name') || platform

    let finalUrl = url
    if (platform === 'youtube') {
      const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)
      if (videoIdMatch) {
        finalUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}`
      }
    } else if (platform === 'instagram' && !url.includes('/embed')) {
      finalUrl = url.replace(/\/$/, '') + '/embed'
    }

    return NextResponse.json({
      url: finalUrl,
      platform,
      title: title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
      thumbUrl,
      authorName,
      kind: 'embed'
    })
  } catch (err) {
    console.error('[oembed] failed:', err)
    return NextResponse.json({ error: 'Failed to fetch embed details' }, { status: 500 })
  }
}
