// next.config.ts
import type { NextConfig } from 'next'

// Suppress harmless Node.js v22 deprecation warnings from third-party packages (like Google Auth)
// so they don't trigger the Next.js red error overlay during development.
if (process.env.NODE_ENV === 'development') {
  const originalEmit = process.emit
  // @ts-expect-error - overriding process.emit for warning suppression
  process.emit = function (name, data, ...args) {
    if (name === 'warning' && data && data.name === 'DeprecationWarning' && data.message?.includes('zlib.bytesRead')) {
      return false
    }
    return originalEmit.apply(process, [name, data, ...args] as any)
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  // Required to use firebase-admin in API routes
  serverExternalPackages: ['firebase-admin'],

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ]
  },
}

export default nextConfig