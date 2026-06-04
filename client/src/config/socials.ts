/**
 * Each `brand` (and optional `brandLight`) is an RGB triplet string ("r g b"),
 * the format our CSS design tokens use — plugs directly into `rgb(var(--accent))`.
 * `brandLight` overrides `brand` when the active theme is `light`; leave it
 * undefined to reuse the same color in both themes.
 */
export type SocialLink = {
  name: string
  handle: string
  href: string
  iconSrc: string
  iconSize: number
  description: string
  cta: string
  brand: string
  brandLight?: string
}

export const SOCIALS: SocialLink[] = [
  {
    name: 'Instagram',
    handle: '@don.withyou',
    href: 'https://www.instagram.com/don.withyou/',
    iconSrc: '/icons/instagram.svg',
    iconSize: 28,
    description: 'Photos & personal life',
    cta: 'Open on Instagram',
    brand: '217 26 122',
  },
  {
    name: 'LinkedIn',
    handle: 'Don H. Laliberte',
    href: 'https://www.linkedin.com/in/don-h-laliberte/',
    iconSrc: '/icons/linkedin.svg',
    iconSize: 28,
    description: 'Professional profile',
    cta: 'Open on LinkedIn',
    brand: '0 119 183',
  },
  {
    name: 'GitHub',
    handle: 'Don-Laliberte',
    href: 'https://github.com/Don-Laliberte',
    iconSrc: '/icons/github.svg',
    iconSize: 32,
    description: 'Projects & code',
    cta: 'Open on GitHub',
    brand: '180 140 255',
  },
  {
    name: 'Email',
    handle: 'donhlaliberte@outlook.com',
    href: 'mailto:donhlaliberte@outlook.com',
    iconSrc: '/icons/email.svg',
    iconSize: 28,
    description: 'Business inquiries',
    cta: 'Send an email',
    // Dark mode: strong greyish-white (warm metallic neutral).
    // Light mode: solid black — cream bg washes out the neutral grey, so we
    // collapse the accent down to maximum contrast instead.
    brand: '212 210 204',
    brandLight: '0 0 0',
  },
]
