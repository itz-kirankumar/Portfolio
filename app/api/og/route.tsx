import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { getCachedTheme } from '@/lib/theme'
import { getCachedSiteContent } from '@/lib/site'


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const title = searchParams.get('title')
    const type = searchParams.get('type') // 'post', 'service', 'page'

    const [theme, site] = await Promise.all([
      getCachedTheme(),
      getCachedSiteContent(),
    ])

    const primaryColor = theme.light.coral || '#e8543f'
    const bgColor = theme.light.paper || '#fbf7f0'
    const textColor = theme.light.ink || '#1a1815'

    const displayTitle = title || site.meta.name
    const subtitle = title ? site.meta.name : site.meta.descriptor

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundColor: bgColor,
            padding: '80px',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '40px',
            }}
          >
            <span
              style={{
                fontSize: '32px',
                color: primaryColor,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              {type || 'Portfolio'}
            </span>
          </div>

          <div
            style={{
              fontSize: '84px',
              fontWeight: 800,
              color: textColor,
              lineHeight: 1.1,
              letterSpacing: '-2px',
              marginBottom: '30px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {displayTitle}
          </div>

          <div
            style={{
              fontSize: '36px',
              color: textColor,
              opacity: 0.7,
              fontWeight: 400,
            }}
          >
            {subtitle}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.error(e)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}