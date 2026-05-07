import type { Metadata, Viewport } from 'next'
import { Jersey_25, Pixelify_Sans } from 'next/font/google'
import Script from 'next/script'
import { MainLayout } from '@/features/layout'
import { ThemeProvider, themeInitScript } from '@/lib/theme-provider'
import { MotionProvider } from '@/lib/motion-provider'
import './globals.css'

const pixelify = Pixelify_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display-loaded',
  display: 'swap',
})

const jersey25 = Jersey_25({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-jersey-loaded',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Don Laliberte',
  description: "Don Laliberte's portfolio — Software Developer",
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
      className={`${pixelify.variable} ${jersey25.variable}`}
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
