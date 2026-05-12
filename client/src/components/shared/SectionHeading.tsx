'use client'

import { m, useInView, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Divider } from './Divider'
import { TypewriterLine, type LineState, type TypewriterSegment } from './TypewriterText'

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  accent?: ReactNode
  tail?: ReactNode
  subtitle?: ReactNode
  className?: string
  align?: 'left' | 'center'
}

function nodeToPlainString(node: ReactNode): string | null {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  return null
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
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const prefersReduced = useReducedMotion() ?? false
  const [lineIndex, setLineIndex] = useState(0)

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const, delay },
    }),
  }

  const titleStr = nodeToPlainString(title)
  const accentStr = accent != null ? nodeToPlainString(accent) : ''
  const tailStr = tail != null ? nodeToPlainString(tail) : ''
  const subtitleStr = subtitle != null ? nodeToPlainString(subtitle) : ''

  const h2Segments: TypewriterSegment[] = useMemo(() => {
    if (titleStr === null) return []
    const segs: TypewriterSegment[] = [{ text: titleStr, final: 'text' }]
    if (accentStr) {
      segs.push({ text: ' ', final: 'text' })
      segs.push({ text: accentStr, final: 'accent' })
    }
    if (tailStr) {
      segs.push({ text: tailStr, final: 'text' })
    }
    return segs
  }, [titleStr, accentStr, tailStr])

  const lineCount = useMemo(() => {
    let n = 1
    if (eyebrow) n += 1
    if (subtitleStr !== null && subtitleStr !== '') n += 1
    return n
  }, [eyebrow, subtitleStr])

  useEffect(() => {
    if (!inView) return
    if (prefersReduced) {
      setLineIndex(lineCount)
    }
  }, [inView, prefersReduced, lineCount])

  const lineState = useCallback(
    (i: number): LineState => {
      if (prefersReduced && inView) return 'done'
      if (!inView) return 'idle'
      if (i < lineIndex) return 'done'
      if (i === lineIndex) return 'running'
      return 'idle'
    },
    [inView, lineIndex, prefersReduced],
  )

  const onLineDone = useCallback(() => {
    setLineIndex((j) => Math.min(j + 1, lineCount))
  }, [lineCount])

  const alignment = align === 'center' ? 'items-center text-center' : 'items-start text-left'

  const useTypewriter = titleStr !== null

  return (
    <m.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className={`flex flex-col ${alignment} ${className}`}
    >
      <m.h2
        variants={fadeUp}
        custom={0.05}
        className="font-display text-4xl font-bold leading-tight md:text-5xl heading-glow"
      >
        {useTypewriter ? (
          <TypewriterLine
            segments={h2Segments}
            state={lineState(0)}
            onComplete={onLineDone}
            charIntervalMs={18}
            maxLineDurationMs={1700}
            settleMs={340}
            showCursor={lineIndex === 0}
          />
        ) : (
          <>
            {title}
            {accent ? (
              <>
                {' '}
                <span style={{ color: 'rgb(var(--accent-bright))' }}>{accent}</span>
              </>
            ) : null}
            {tail ? <>{tail}</> : null}
          </>
        )}
      </m.h2>

      <Divider
        delay={0.18}
        flip
        className={`${align === 'center' ? 'my-6 w-40' : 'my-5 w-full max-w-sm'}`}
      />

      {eyebrow ? (
        <m.span variants={fadeUp} custom={0.28} className="eyebrow">
          {useTypewriter ? (
            <TypewriterLine
              segments={[{ text: eyebrow, final: 'eyebrow' }]}
              state={lineState(1)}
              onComplete={onLineDone}
              charIntervalMs={16}
              maxLineDurationMs={1400}
              settleMs={320}
              showCursor={lineIndex === 1}
            />
          ) : (
            eyebrow
          )}
        </m.span>
      ) : null}

      {subtitleStr !== null && subtitleStr !== '' ? (
        <m.p
          variants={fadeUp}
          custom={0.38}
          className="mt-3 max-w-xl text-base leading-relaxed text-muted"
        >
          {useTypewriter ? (
            <TypewriterLine
              segments={[{ text: subtitleStr, final: 'muted' }]}
              state={lineState(eyebrow ? 2 : 1)}
              onComplete={onLineDone}
              charIntervalMs={13}
              maxLineDurationMs={2600}
              settleMs={340}
              showCursor={lineIndex === (eyebrow ? 2 : 1)}
            />
          ) : (
            subtitleStr
          )}
        </m.p>
      ) : subtitle ? (
        <m.p
          variants={fadeUp}
          custom={0.38}
          className="mt-3 max-w-xl text-base leading-relaxed text-muted"
        >
          {subtitle}
        </m.p>
      ) : null}
    </m.div>
  )
}
