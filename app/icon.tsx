// app/icon.tsx
//
// The favicon, drawn from the owner's initial so it follows a name change in
// the admin without anyone opening an image editor.
//
// NOT `runtime = 'edge'`. Reading the name means reading site/content, which
// means firebase-admin, which is Node-only — the edge build fails at
// "collect page data" with "the edge runtime does not support Node.js
// 'process'". ImageResponse works fine on the Node runtime in Next 16.
//
// getCachedSiteContent() is unstable_cache'd with `revalidate: false`, so this
// is one Firestore read per deployment, not one per favicon request.

import { ImageResponse } from 'next/og'
import { getCachedSiteContent } from '@/lib/site'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default async function Icon() {
  let initial = 'K'
  try {
    const content = await getCachedSiteContent()
    initial = (content?.meta?.name?.trim()?.charAt(0) || 'K').toUpperCase()
  } catch {
    // A favicon is never worth failing a render over.
  }

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          background: '#E8593B',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FBF7F0',
          borderRadius: '50%',
          fontWeight: 700,
          fontFamily: 'sans-serif',
        }}
      >
        {initial}
      </div>
    ),
    { ...size }
  )
}
