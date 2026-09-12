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

import { getCachedSiteContent } from '@/lib/site'

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getCachedSiteContent()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kirankumarg.com'
  
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: meta.name,
      template: `%s | ${meta.name}`,
    },
    description: meta.descriptor,
    keywords: meta.keywords?.split(',').map(k => k.trim()),
    authors: [{ name: meta.name }],
    creator: meta.name,
    openGraph: {
      type: 'profile',
      siteName: meta.name,
      title: meta.name,
      description: meta.descriptor,
      url: siteUrl,
      locale: 'en_IN',
      images: [
        {
          url: meta.ogImageUrl || `${siteUrl}/api/og?title=${encodeURIComponent(meta.name)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.name,
      description: meta.descriptor,
      creator: meta.twitterHandle,
      images: [meta.ogImageUrl || `${siteUrl}/api/og?title=${encodeURIComponent(meta.name)}`],
    },
    robots: { index: true, follow: true },
  }
}

import { NewsletterPopup } from '@/components/site/NewsletterPopup'
import { Tracker } from '@/components/site/Tracker'
import { ThemeProvider } from '@/components/site/ThemeProvider'
import { getCachedTheme } from '@/lib/theme'

export const viewport: Viewport = {
  themeColor: '#FBF7F0',
  colorScheme: 'light',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await getCachedTheme()

  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${inter.variable} ${jetbrains.variable} ${caveat.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeProvider theme={theme} />
        {theme.darkMode === 'toggle' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark')
                  } else {
                    document.documentElement.classList.remove('dark')
                  }
                } catch (_) {}
              `,
            }}
          />
        )}
      </head>
      <body className="bg-paper text-ink font-sans antialiased" suppressHydrationWarning>
        <Tracker />
        {children}
        <NewsletterPopup />
      </body>
    </html>
  )
}
