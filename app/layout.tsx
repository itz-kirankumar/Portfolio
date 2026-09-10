// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Inter, JetBrains_Mono, Caveat } from 'next/font/google'
import './globals.css'

/* Variable builds — omitting `weight` ships one file per family instead of one
   per weight. `preload: false` on the two below-the-fold faces. */
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  preload: false,
})

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
  preload: false,
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kirankumarg.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Kiran Kumar G — 0→1 operator, strategy & GTM',
    template: '%s · Kiran Kumar G',
  },
  description:
    'I take products from zero to paying users. Co-founder, EdTech SaaS scaled to 12K members and 600+ paid users. Strategy, go-to-market and operations.',
  authors: [{ name: 'Kiran Kumar G' }],
  creator: 'Kiran Kumar G',
  openGraph: {
    type: 'profile',
    siteName: 'Kiran Kumar G',
    title: 'Kiran Kumar G — 0→1 operator, strategy & GTM',
    description: 'I take products from zero to paying users.',
    url: siteUrl,
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kiran Kumar G — 0→1 operator, strategy & GTM',
    description: 'I take products from zero to paying users.',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#FBF7F0',
  colorScheme: 'light',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${inter.variable} ${jetbrains.variable} ${caveat.variable}`}
      suppressHydrationWarning
    >
      {/* suppressHydrationWarning on body absorbs extension attribute injection */}
      <body className="bg-paper text-ink font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
