'use client'

import { m, useInView } from 'framer-motion'
import { useRef } from 'react'
import { TypewriterLine } from '@/components/shared/TypewriterText'
import { useTypewriterSequence } from '@/lib/use-typewriter-sequence'

const BODY =
  "If you're interested in me yapping about my new programming hyperfixations"

export function PostsSection() {
  const rootRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rootRef, { once: true, amount: 0.3 })

  const { lineState, onLineDone, showCursor, isComplete } = useTypewriterSequence({
    lineCount: 3,
    active: inView,
  })

  return (
    <m.div
      ref={rootRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="flex flex-col items-center text-center"
    >
      <h2 className="font-display text-4xl font-bold leading-tight md:text-6xl heading-glow">
        <TypewriterLine
          segments={[
            { text: 'Posts', final: 'text' },
            { text: ' ', final: 'text' },
            { text: 'Incoming', final: 'accent' },
          ]}
          state={lineState(0)}
          onComplete={onLineDone}
          charIntervalMs={18}
          maxLineDurationMs={1400}
          settleMs={340}
          showCursor={showCursor(0)}
        />
      </h2>

      <p className="mt-6 max-w-md font-body text-xl leading-relaxed text-muted md:text-2xl">
        <TypewriterLine
          segments={[{ text: BODY, final: 'muted' }]}
          state={lineState(1)}
          onComplete={onLineDone}
          charIntervalMs={12}
          maxLineDurationMs={2600}
          settleMs={320}
          showCursor={showCursor(1)}
        />
      </p>

      <p
        className="mt-8 flex items-center gap-1 font-tech text-sm uppercase tracking-[0.3em]"
        style={{ color: 'rgb(var(--accent))' }}
        aria-label="Coming soon"
      >
        {isComplete ? (
          <>
            <span>Stay tuned</span>
            <span className="animate-blink inline-block" aria-hidden>
              _
            </span>
          </>
        ) : (
          <TypewriterLine
            segments={[{ text: 'Stay tuned', final: 'accentToken' }]}
            state={lineState(2)}
            onComplete={onLineDone}
            charIntervalMs={20}
            maxLineDurationMs={650}
            settleMs={240}
            showCursor={showCursor(2)}
          />
        )}
      </p>
    </m.div>
  )
}
