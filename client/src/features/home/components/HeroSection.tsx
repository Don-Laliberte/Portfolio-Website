'use client'

import { m } from 'framer-motion'
import { Divider } from '@/components/shared/Divider'

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' as const, delay },
  }),
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
      className="flex max-w-[720px] flex-col pt-[8vh] md:pt-[14vh]"
    >
      <m.span variants={fadeUp} custom={0.05} className="eyebrow mb-4">
        Software Developer · UCalgary Student · CSUS President 2027
      </m.span>

      <Divider delay={0.1} className="mb-6 max-w-sm" flip />

      <m.h1
        variants={fadeUp}
        custom={0.2}
        className="font-display text-5xl font-bold leading-[1.05] md:text-7xl heading-glow"
        style={{ color: 'rgb(var(--text))' }}
      >
        Hello, I&apos;m{' '}
        <span style={{ color: 'rgb(var(--accent-bright))' }}>Don!</span>
      </m.h1>

      <m.p
        variants={fadeUp}
        custom={0.35}
        className="mt-5 max-w-[560px] font-body text-xl leading-relaxed md:text-2xl"
        style={{ color: 'rgb(var(--text) / 0.75)' }}
      >
        A young aspiring developer building tools, community sites, and
        occasionally pixel art. Currently shipping for UofC and learning loud.
      </m.p>

      <m.div
        variants={fadeUp}
        custom={0.55}
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
