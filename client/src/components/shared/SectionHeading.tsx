'use client'

import { m } from 'framer-motion'
import type { ReactNode } from 'react'
import { Divider } from './Divider'

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  accent?: ReactNode
  tail?: ReactNode
  subtitle?: ReactNode
  className?: string
  align?: 'left' | 'center'
}

export function SectionHeading({
  eyebrow,
  title,
  accent,
  tail,
  subtitle,
  className = '',
  align = 'left',
}: SectionHeadingProps) {
  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const, delay },
    }),
  }

  const alignment = align === 'center' ? 'items-center text-center' : 'items-start text-left'

  return (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className={`flex flex-col ${alignment} ${className}`}
    >
      {eyebrow ? (
        <m.span variants={fadeUp} custom={0.05} className="eyebrow mb-3">
          {eyebrow}
        </m.span>
      ) : null}

      <m.h2
        variants={fadeUp}
        custom={0.12}
        className="font-display text-4xl font-bold leading-tight md:text-5xl heading-glow"
        style={{ color: 'rgb(var(--text))' }}
      >
        {title}
        {accent ? (
          <>
            {' '}
            <span style={{ color: 'rgb(var(--accent-bright))' }}>{accent}</span>
          </>
        ) : null}
        {tail ? <>{tail}</> : null}
      </m.h2>

      <Divider
        delay={0.25}
        flip
        className={`${align === 'center' ? 'my-6 w-40' : 'my-5 w-full max-w-sm'}`}
      />

      {subtitle ? (
        <m.p
          variants={fadeUp}
          custom={0.3}
          className="max-w-xl text-base leading-relaxed text-muted"
        >
          {subtitle}
        </m.p>
      ) : null}
    </m.div>
  )
}
