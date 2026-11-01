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

  // Preserve the existing /writing/<slug>?preview=true URLs: serve them from
  // the dynamic owner-preview route without changing the address bar.
  async rewrites() {
    return [
      {
        source: '/writing/:slug',
        has: [{ type: 'query' as const, key: 'preview', value: 'true' }],
        destination: '/preview/writing/:slug',
      },
    ]
  },

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