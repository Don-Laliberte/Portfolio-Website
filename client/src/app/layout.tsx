import type { Metadata } from 'next'
import { Providers } from './providers'
import { MainLayout } from '@/features/layout'
import './globals.css'

export const metadata: Metadata = {
  title: 'Don Laliberte',
  description: "Don Laliberte's portfolio - Software Developer",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="p5-stripe-bg">
      <body className="chakra-ui-dark" suppressHydrationWarning style={{ fontFamily: 'var(--font-body)' }}>
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  )
}
