'use client'

import { m } from 'framer-motion'
import { CyberPanel } from '@/components/shared/CyberPanel'
import { MaskIcon } from '@/components/shared/MaskIcon'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { useTheme } from '@/lib/theme-provider'

// Each `brand` (and optional `brandLight`) is an RGB triplet string ("r g b"),
// the format our CSS design tokens use — plugs directly into `rgb(var(--accent))`.
// `brandLight` overrides `brand` when the active theme is `light`; leave it
// undefined to reuse the same color in both themes.
const socials: Array<{
  name: string
  handle: string
  href: string
  iconSrc: string
  iconSize: number
  description: string
  cta: string
  brand: string
  brandLight?: string
}> = [
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

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
}
const item = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

export function SocialsSection() {
  const { theme } = useTheme()

  return (
    <div className="flex flex-col">
      <SectionHeading
        eyebrow="Socials"
        title="Find me"
        accent="Online"
        subtitle="Here are some of the best places to reach me. Feel free to connect or chat."
      />

      <m.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mt-10 grid grid-cols-1 gap-5 md:mt-12 md:grid-cols-2 md:gap-6"
      >
        {socials.map((s) => {
          const brandRgb = theme === 'light' && s.brandLight ? s.brandLight : s.brand
          // Email uses mailto: which shouldn't open a new tab; everything else
          // is an external link that should.
          const isMailto = s.href.startsWith('mailto:')
          return (
          <m.a
            key={s.name}
            variants={item}
            href={s.href}
            target={isMailto ? undefined : '_blank'}
            rel={isMailto ? undefined : 'noopener noreferrer'}
            aria-label={s.cta}
            className="group block no-underline"
            // Override accent tokens (and --glow) locally so the entire card —
            // top stripe, hover border/glow, icon fill, and CTA text — adopts
            // the brand color for that social network. The brand is a plain
            // RGB triplet string ("217 26 122"), the format our tokens expect.
            style={{
              ['--accent' as string]: brandRgb,
              ['--accent-bright' as string]: brandRgb,
              ['--glow' as string]: brandRgb,
            }}
          >
            <CyberPanel
              hover
              className="flex h-full flex-col p-6"
            >
              <div className="mb-4 flex items-center gap-4">
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-sm"
                  style={{
                    background: 'rgb(var(--bg-panel) / 0.5)',
                    border: '1px solid rgb(var(--border) / 0.35)',
                  }}
                >
                  <MaskIcon
                    src={s.iconSrc}
                    size={s.iconSize}
                    color="rgb(var(--accent))"
                  />
                </div>
                <div className="min-w-0">
                  <p
                    className="font-display text-xl font-bold"
                    style={{ color: 'rgb(var(--text))' }}
                  >
                    {s.name}
                  </p>
                  <p className="truncate font-tech text-xs uppercase tracking-[0.2em] text-muted">
                    {s.handle}
                  </p>
                </div>
              </div>

              <p className="mb-4 text-base leading-relaxed text-muted">{s.description}</p>

              <span className="social-cta mt-auto flex items-center gap-2 font-tech text-sm uppercase tracking-[0.22em]">
                {s.cta}
                <span
                  aria-hidden
                  className="social-cta-arrow inline-block transition-transform duration-200"
                >
                  →
                </span>
              </span>
            </CyberPanel>
          </m.a>
          )
        })}
      </m.div>
    </div>
  )
}
