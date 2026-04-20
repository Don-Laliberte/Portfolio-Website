'use client'

import { m } from 'framer-motion'
import type { ReactNode } from 'react'
import { SectionHeading } from '@/components/shared/SectionHeading'

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: 'easeOut' as const, delay },
  }),
}

const blocks: Array<{ title: string; body: string }> = [
  {
    title: 'The short version',
    body:
      'Full-stack developer, designer-by-necessity, perpetual tinkerer. I build things I want to exist and occasionally ship them.',
  },
  {
    title: 'What I care about',
    body:
      'Tools that respect their users, interfaces that feel alive, and code you can actually read a year later. I prefer doing the hard thing twice over the wrong thing once.',
  },
  {
    title: 'Outside the editor',
    body:
      'Music, esports, club organizing, and pretending my dark-mode habit is a lifestyle. I help run the CS community at the University of Calgary.',
  },
]

export function AboutSection() {
  return (
    <div className="flex flex-col">
      <SectionHeading
        eyebrow="Who am I?"
        title="Don"
        accent="Laliberte"
        subtitle="Computer Science student at the University of Calgary. I work across the stack and ship software that people actually use."
      />

      <m.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="mt-10 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-6"
      >
        {blocks.map((block, i) => (
          <m.div key={block.title} variants={fadeUp} custom={0.15 + i * 0.1}>
            <ContentBlock title={block.title} index={i}>
              {block.body}
            </ContentBlock>
          </m.div>
        ))}
      </m.div>
    </div>
  )
}

function ContentBlock({
  title,
  index,
  children,
}: {
  title: string
  index: number
  children: ReactNode
}) {
  return (
    <div
      className="relative overflow-hidden pl-5"
      style={{ borderLeft: '2px solid rgb(var(--accent) / 0.4)' }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 select-none font-display text-[72px] font-black leading-none"
        style={{ color: 'rgb(var(--accent) / 0.08)' }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>
      <h3
        className="mb-2 font-tech text-xs font-bold uppercase tracking-[0.24em]"
        style={{ color: 'rgb(var(--accent))' }}
      >
        {title}
      </h3>
      <p className="text-base leading-relaxed text-muted">{children}</p>
    </div>
  )
}
