'use client'

import { m, useInView } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { TypewriterLine } from '@/components/shared/TypewriterText'
import { useTypewriterSequence } from '@/lib/use-typewriter-sequence'

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
      'Full-stack developer, designer-by-necessity, perpetual tinkerer. I build things I want to exist because I believe in their value. I do it out of love for creating.',
  },
  {
    title: 'What I care about',
    body:
      'I like self-improvement and pushing the quality bar in this industry. I build tools with users in mind, while still keeping my whimsy. Takeaway, I\'m a "measure twice, cut once" kind of person.',
  },
  {
    title: 'Outside the grind',
    body:
      'Music, esports, organizing communities, and building in my own style. I bring a distinct mix of creativity, leadership, and technical depth to the CS community at UCalgary.',
  },
]

export function AboutSection() {
  return (
    <div className="flex flex-col">
      <SectionHeading
        eyebrow="Who am I?"
        title="Don"
        accent="Laliberte"
        subtitle="Computer Science student at the University of Calgary. I'm passionate about our growing community and creating the impact I want to see with my work."
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
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.25 })
  const body = typeof children === 'string' ? children : ''

  const { lineState, onLineDone, showCursor } = useTypewriterSequence({
    lineCount: 2,
    active: inView,
  })

  return (
    <div
      ref={ref}
      className="relative overflow-hidden border-l-accent pl-5"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 select-none font-display text-[72px] font-black leading-none text-accent-faint"
      >
        {String(index + 1).padStart(2, '0')}
      </span>
      <h3 className="mb-2 font-tech text-xs font-bold uppercase tracking-[0.24em] text-accent">
        <TypewriterLine
          segments={[{ text: title, final: 'accentToken' }]}
          state={lineState(0)}
          onComplete={onLineDone}
          charIntervalMs={20}
          maxLineDurationMs={1100}
          settleMs={300}
          showCursor={showCursor(0)}
        />
      </h3>
      <p className="text-base leading-relaxed text-muted">
        <TypewriterLine
          segments={[{ text: body, final: 'muted' }]}
          state={lineState(1)}
          onComplete={onLineDone}
          charIntervalMs={11}
          maxLineDurationMs={2600}
          settleMs={340}
          showCursor={showCursor(1)}
        />
      </p>
    </div>
  )
}
