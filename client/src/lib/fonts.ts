import { Jersey_25, Pixelify_Sans } from 'next/font/google'

export const pixelifySans = Pixelify_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display-loaded',
  display: 'swap',
})

export const jersey25 = Jersey_25({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-jersey-loaded',
  display: 'swap',
})
