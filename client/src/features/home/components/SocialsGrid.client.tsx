'use client'

import { m, useInView, useReducedMotion } from 'framer-motion'
import { useRef, useState } from 'react'
import { CyberPanel } from '@/components/shared/CyberPanel'
import { MaskIcon } from '@/components/shared/MaskIcon'
import { TypewriterLine, type LineState } from '@/components/shared/TypewriterText'
import type { SocialLink } from '@/config/socials'
import { useTheme } from '@/lib/theme-provider'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
}

const item = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

type SocialsGridProps = {
  socials: SocialLink[]
}

function SocialCardTypedBody({ social }: { social: SocialLink }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.15, margin: '0px 0px -8% 0px' })
  const prefersReduced = useReducedMotion() ?? false
  const [bodyDone, setBodyDone] = useState(false)

  const bodyState: LineState =
    prefersReduced || bodyDone ? 'done' : inView ? 'running' : 'idle'

  return (
    <div ref={ref} className="flex h-full flex-col">
      <div className="mb-4 flex items-center gap-4">
        <div className="mb-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-sm bg-panel-soft border-token-muted">
          <MaskIcon src={social.iconSrc} size={social.iconSize} color="rgb(var(--accent))" />
        </div>
        <div className="min-w-0">
          <p className="font-display text-xl font-bold text-foreground">
            {social.name}
          </p>
          <p className="truncate font-tech text-xs uppercase tracking-[0.2em] text-muted">
            {social.handle}
          </p>
        </div>
      </div>

      <p className="mb-4 text-base leading-relaxed text-muted">
        <TypewriterLine
          segments={[{ text: social.description, final: 'muted' }]}
          state={bodyState}
          onComplete={() => setBodyDone(true)}
          charIntervalMs={11}
          maxLineDurationMs={1800}
          settleMs={320}
          showCursor={!prefersReduced && inView && !bodyDone}
        />
      </p>

      <span className="social-cta mt-auto flex items-center gap-2 font-tech text-sm uppercase tracking-[0.22em]">
        {social.cta}
        <span
          aria-hidden
          className="social-cta-arrow inline-block transition-transform duration-200"
        >
          →
        </span>
      </span>
    </div>
  )
}

export function SocialsGrid({ socials }: SocialsGridProps) {
  const { theme } = useTheme()

  return (
    <m.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="mt-10 grid grid-cols-1 gap-5 md:mt-12 md:grid-cols-2 md:gap-6"
    >
      {socials.map((social) => {
        const brandRgb =
          theme === 'light' && social.brandLight ? social.brandLight : social.brand
        const isMailto = social.href.startsWith('mailto:')

        return (
          <m.a
            key={social.name}
            variants={item}
            href={social.href}
            target={isMailto ? undefined : '_blank'}
            rel={isMailto ? undefined : 'noopener noreferrer'}
            aria-label={social.cta}
            className="group block no-underline"
            style={{
              ['--accent' as string]: brandRgb,
              ['--accent-bright' as string]: brandRgb,
              ['--glow' as string]: brandRgb,
            }}
          >
            <CyberPanel hover className="flex h-full flex-col p-6">
              <SocialCardTypedBody social={social} />
            </CyberPanel>
          </m.a>
        )
      })}
    </m.div>
  )
}
