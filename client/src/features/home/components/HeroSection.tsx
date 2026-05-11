'use client'

import { m } from 'framer-motion'
import { Divider } from '@/components/shared/Divider'
import { HeroLaptop } from './HeroLaptop'

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
      //
      // Mobile / small-desktop: hero laptop stacked above the heading
      // (flex-col-reverse keeps the text as the first child in source order
      // for a11y / DOM order, but renders the laptop first visually).
      //
      // We hold the stacked layout all the way up to xl (≥1280px) because
      // the eyebrow ("…CSUS PRESIDENT 2027") at Jersey 25 + 0.28em tracking is
      // ~680px wide. Combined with the laptop + gap, the two-column
      // layout needs ~960px of content area, which only fits comfortably
      // once FullPageSection's lg:px-16 padding is offset by the wider
      // xl viewport.
      //
      // `my-auto` centres the stacked layout vertically inside the
      // FullPageSection's min-h-100vh track (parent uses justify-start, so
      // auto margins absorb the free space equally top + bottom). On xl
      // we reset it and restore the original pt-[14vh] top offset so the
      // two-column layout still sits cleanly below the sticky navbar.
      className="my-auto flex flex-col-reverse gap-8 xl:my-0 xl:flex-row xl:items-start xl:gap-14 xl:pt-[14vh] 2xl:gap-16"
    >
      <div className="flex min-w-0 flex-1 flex-col pr-0 xl:min-w-0 xl:pr-2">
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

        <m.span
          variants={fadeUp}
          custom={0.4}
          className="eyebrow max-w-full max-xl:whitespace-nowrap xl:whitespace-normal xl:max-w-[min(100%,36rem)]"
        >
          Software Developer · UCalgary Student · CSUS President 2027
        </m.span>

        <m.p
          variants={fadeUp}
          custom={0.5}
          className="mt-5 max-w-[560px] font-body text-xl leading-relaxed md:text-2xl"
          style={{ color: 'rgb(var(--text) / 0.75)' }}
        >
          A young aspiring developer building tools, community sites, and
          occasionally pixel art. Currently leading CSUS and the UofC tech community.
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

      <HeroLaptop />
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
