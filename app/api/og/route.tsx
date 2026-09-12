import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const title = searchParams.get('title') || 'My Portfolio'
    const cover = searchParams.get('cover')

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '80px',
            backgroundColor: '#0a0a0a',
            backgroundImage: cover ? `url(${cover})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {cover && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.6)',
              }}
            />
          )}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1,
            }}
          >
            <h1
              style={{
                fontSize: 80,
                fontWeight: 800,
                color: 'white',
                lineHeight: 1.1,
                marginBottom: 30,
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: '#ff6b4a',
                  marginRight: 16,
                }}
              />
              <span
                style={{
                  fontSize: 32,
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Article
              </span>
            </div>
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
    return new Response(`Failed to generate image`, {
      status: 500,
    })
  }
}