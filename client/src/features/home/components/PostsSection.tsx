'use client'

import { m } from 'framer-motion'

export function PostsSection() {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="flex flex-col items-center text-center"
    >
      <h2
        className="font-display text-4xl font-bold leading-tight md:text-6xl heading-glow"
        style={{ color: 'rgb(var(--text))' }}
      >
        Posts{' '}
        <span style={{ color: 'rgb(var(--accent-bright))' }}>Incoming</span>
      </h2>

      <p className="mt-6 max-w-md font-body text-xl leading-relaxed text-muted md:text-2xl">
        <span>If you&apos;re interested in me yapping about my new programming hyperfixations</span>
      </p>

      <p
        className="mt-8 flex items-center gap-1 font-tech text-sm uppercase tracking-[0.3em]"
        style={{ color: 'rgb(var(--accent))' }}
        aria-label="Coming soon"
      >
        <span>Stay tuned</span>
        <span className="animate-blink inline-block" aria-hidden>
          _
        </span>
      </p>
    </m.div>
  )
}
