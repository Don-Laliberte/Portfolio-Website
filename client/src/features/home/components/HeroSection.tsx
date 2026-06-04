'use client'

import { m } from 'framer-motion'
import { useSyncExternalStore } from 'react'
import { Divider } from '@/components/shared/Divider'
import { TypewriterLine } from '@/components/shared/TypewriterText'
import { useTypewriterSequence } from '@/lib/use-typewriter-sequence'
import { HeroLaptop } from './HeroLaptop'

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' as const, delay },
  }),
}

const H1_SEGMENTS = [
  { text: "Hello, I'm ", final: 'text' as const },
  { text: 'Don!', final: 'accent' as const },
]

const EYEBROW =
  'Software Developer · UCalgary Student · CSUS President 2027'

const BODY =
  'A young aspiring developer building tools, community sites, and occasionally pixel art. Currently leading CSUS and the UofC tech community.'

const emptySubscribe = () => () => undefined

export function HeroSection() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

  const { lineState, onLineDone, showCursor } = useTypewriterSequence({
    lineCount: 3,
    active: mounted,
  })

  return (
    <m.div
      initial="hidden"
      animate="visible"
      // Hero layout: laptop stacks above copy until xl; `my-auto` centers the
      // stack in the full-page section. See FullPageSection + page.tsx for context.
      className="my-auto flex flex-col-reverse gap-8 xl:my-0 xl:flex-row xl:items-start xl:gap-14 xl:pt-[14vh] 2xl:gap-16"
    >
      <div className="flex min-w-0 flex-1 flex-col pr-0 xl:min-w-0 xl:pr-2">
        <m.h1
          variants={fadeUp}
          custom={0.1}
          className="font-display text-5xl font-bold leading-[1.05] md:text-7xl heading-glow"
        >
          <TypewriterLine
            segments={H1_SEGMENTS}
            state={lineState(0)}
            onComplete={onLineDone}
            charIntervalMs={19}
            maxLineDurationMs={1500}
            settleMs={340}
            showCursor={showCursor(0)}
          />
        </m.h1>

        <Divider delay={0.25} className="my-6 max-w-sm" flip />

        <m.span
          variants={fadeUp}
          custom={0.4}
          className="eyebrow max-w-full leading-snug xl:max-w-[min(100%,36rem)]"
        >
          <TypewriterLine
            segments={[{ text: EYEBROW, final: 'eyebrow' }]}
            state={lineState(1)}
            onComplete={onLineDone}
            charIntervalMs={15}
            maxLineDurationMs={2000}
            settleMs={320}
            showCursor={showCursor(1)}
          />
        </m.span>

        <m.p
          variants={fadeUp}
          custom={0.5}
          className="mt-5 max-w-[560px] font-body text-xl leading-relaxed md:text-2xl"
        >
          <TypewriterLine
            segments={[{ text: BODY, final: 'bodyHero' }]}
            state={lineState(2)}
            onComplete={onLineDone}
            charIntervalMs={12}
            maxLineDurationMs={2600}
            settleMs={340}
            showCursor={showCursor(2)}
          />
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
