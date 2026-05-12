import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { MainLayout } from '@/features/layout'
import { jersey25, pixelifySans } from '@/lib/fonts'
import { ThemeProvider, themeInitScript } from '@/lib/theme-provider'
import { MotionProvider } from '@/lib/motion-provider'
import './globals.css'

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
