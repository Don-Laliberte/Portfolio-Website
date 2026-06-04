'use client'

import { m, useInView } from 'framer-motion'
import { useRef } from 'react'
import { TypewriterLine } from '@/components/shared/TypewriterText'
import type { AboutBlock } from '@/config/about'
import { useTypewriterSequence } from '@/lib/use-typewriter-sequence'

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: 'easeOut' as const, delay },
  }),
}

type AboutBlocksProps = {
  blocks: AboutBlock[]
}

export function AboutBlocks({ blocks }: AboutBlocksProps) {
  return (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className="mt-10 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-6"
    >
      {blocks.map((block, i) => (
        <m.div key={block.title} variants={fadeUp} custom={0.15 + i * 0.1}>
          <ContentBlock block={block} index={i} />
        </m.div>
      ))}
    </m.div>
  )
}

function ContentBlock({ block, index }: { block: AboutBlock; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.25 })

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
          segments={[{ text: block.title, final: 'accentToken' }]}
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
          segments={[{ text: block.body, final: 'muted' }]}
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
