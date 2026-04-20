'use client'

import { m } from 'framer-motion'
import Image from 'next/image'
import { Divider } from '@/components/shared/Divider'

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' as const, delay },
  }),
}

// Portrait frame fades in slightly later than the heading, with a gentle
// scale to echo the CRT-zoom feel of the rest of the site without stepping
// on the text's vertical motion.
const portraitIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: 'easeOut' as const, delay: 0.2 },
  },
}

export function HeroSection() {
  return (
    <m.div
      initial="hidden"
      animate="visible"
      // Explicit top offset so the hero content sits cleanly below the sticky
      // navbar (~56px tall + backdrop blur). Uses viewport units so the gap
      // scales with screen height — tight on phones, generous on tall
      // desktops. The section is align="start" (see page.tsx) so this padding
      // actually shifts content instead of being absorbed by flex centering.
      //
      // Mobile: portrait stacked above the heading (flex-col-reverse keeps
      // the text as the first child in source order for a11y / DOM order,
      // but renders the portrait first visually). md+: two columns with the
      // portrait floated right and vertically centered against the text
      // block — md:flex-row wins over flex-col-reverse at the breakpoint.
      className="flex flex-col-reverse gap-8 pt-[8vh] md:flex-row md:items-center md:gap-14 md:pt-[14vh]"
    >
      <div className="flex max-w-[560px] flex-col">
        <m.h1
          variants={fadeUp}
          custom={0.1}
          className="font-display text-5xl font-bold leading-[1.05] md:text-7xl heading-glow"
          style={{ color: 'rgb(var(--text))' }}
        >
          Hello, I&apos;m{' '}
          <span style={{ color: 'rgb(var(--accent-bright))' }}>Don!</span>
        </m.h1>

        <Divider delay={0.25} className="my-6 max-w-sm" flip />

        <m.span variants={fadeUp} custom={0.4} className="eyebrow">
          Software Developer · UCalgary Student · CSUS President 2027
        </m.span>

        <m.p
          variants={fadeUp}
          custom={0.5}
          className="mt-5 max-w-[560px] font-body text-xl leading-relaxed md:text-2xl"
          style={{ color: 'rgb(var(--text) / 0.75)' }}
        >
          A young aspiring developer building tools, community sites, and
          occasionally pixel art. Currently shipping for UofC and learning loud.
        </m.p>

        <m.div
          variants={fadeUp}
          custom={0.65}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <a href="#works" className="btn-accent" aria-label="See my works">
            <span>See Works</span>
            <ArrowIcon />
          </a>
          <a
            href="#socials"
            className="hero-secondary-link group/hero inline-flex items-center gap-1.5 font-tech text-base uppercase tracking-[0.16em]"
          >
            or find me online
            <span
              aria-hidden
              className="hero-secondary-arrow inline-block transition-transform duration-200"
            >
              →
            </span>
          </a>
        </m.div>
      </div>

      <HeroPortrait />
    </m.div>
  )
}

function HeroPortrait() {
  return (
    <m.div
      variants={portraitIn}
      className="relative mx-auto aspect-square w-40 shrink-0 md:mx-0 md:w-[280px]"
    >
      {/* Outer accent ring + glow. Absolutely positioned so it sits on top of
       * the image without clipping, and pointer-events-none so the image
       * itself remains interactive if linked later. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          boxShadow:
            '0 0 0 2px rgb(var(--accent-bright)), 0 0 32px rgb(var(--glow) / 0.35), inset 0 0 24px rgb(var(--accent) / 0.18)',
        }}
      />

      {/* Subtle CRT scanline overlay to match the site's aesthetic. Capped
       * at low alpha so it reads as texture, not noise. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full mix-blend-overlay"
        style={{
          background:
            'repeating-linear-gradient(0deg, rgb(var(--scanline) / calc(var(--scanline-alpha) * 1.5)) 0 1px, transparent 1px 3px)',
        }}
      />

      <Image
        src="/images/don-headshot.jpg"
        alt="Don Laliberte"
        fill
        sizes="(min-width: 768px) 280px, 160px"
        priority
        className="rounded-full object-cover"
        style={{ objectPosition: '50% 30%' }}
      />
    </m.div>
  )
}

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  )
}
