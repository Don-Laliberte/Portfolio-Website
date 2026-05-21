import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { MainLayout } from '@/features/layout'
import { jersey25, pixelifySans } from '@/lib/fonts'
import { ThemeProvider, themeInitScript } from '@/lib/theme-provider'
import { MotionProvider } from '@/lib/motion-provider'
import './globals.css'

/** Canonical site origin for absolute URLs (Open Graph, Twitter cards). */
function toSiteOrigin(value: string | undefined): string | null {
  const trimmed = value?.trim().replace(/\/+$/, '')
  if (!trimmed) return null

  const host = trimmed.split(/[/?#]/, 1)[0] ?? ''
  const localHost = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host)
  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `${localHost ? 'http' : 'https'}://${trimmed}`

  try {
    return new URL(withProtocol).origin
  } catch {
    return null
  }
}

function siteOrigin(): string {
  const explicit = toSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL)
  if (explicit) return explicit
  const vercel = toSiteOrigin(process.env.VERCEL_URL)
  if (vercel) return vercel
  return 'http://localhost:3000'
}

const SITE_URL = siteOrigin()

const defaultTitle = 'Don Laliberte'
const defaultDescription =
  'Software developer and CS student at the University of Calgary — portfolio, projects, and community work.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: defaultTitle,
    template: `%s · ${defaultTitle}`,
  },
  description: defaultDescription,
  applicationName: defaultTitle,
  authors: [{ name: 'Don Laliberte', url: SITE_URL }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: defaultTitle,
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: '/images/don-headshot.jpg',
        width: 1024,
        height: 682,
        type: 'image/jpeg',
        alt: 'Don Laliberte — portrait',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: ['/images/don-headshot.jpg'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5efe6' },
    { media: '(prefers-color-scheme: dark)', color: '#1a0a1a' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${pixelifySans.variable} ${jersey25.variable}`}
    >
      <head />
      <body suppressHydrationWarning>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <ThemeProvider>
          <MotionProvider>
            <MainLayout>{children}</MainLayout>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
