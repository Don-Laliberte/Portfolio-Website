'use client'

import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react'
import { useReducedMotion } from 'framer-motion'

/** Resolved CSS `color` after the pink “typing” phase. */
export type TypewriterFinalKey =
  | 'text'
  | 'accent'
  | 'muted'
  | 'eyebrow'
  | 'bodyHero'
  | 'accentToken'

const FINAL: Record<TypewriterFinalKey, string> = {
  text: 'rgb(var(--text))',
  accent: 'rgb(var(--accent-bright))',
  muted: 'rgb(var(--text-muted) / var(--text-muted-alpha))',
  eyebrow: 'rgb(var(--accent) / 0.8)',
  bodyHero: 'rgb(var(--text) / 0.75)',
  accentToken: 'rgb(var(--accent))',
}

const PINK = 'rgb(var(--accent-bright))'

export type TypewriterSegment = {
  text: string
  final: TypewriterFinalKey
}

export type LineState = 'idle' | 'running' | 'done'

export type TypewriterLineConfig = {
  segments: TypewriterSegment[]
  as?: ElementType
  className?: string
  charIntervalMs?: number
  maxLineDurationMs?: number
  style?: CSSProperties
  showCursor?: boolean
}

export type TypewriterLineProps = TypewriterLineConfig & {
  state: LineState
  onComplete?: () => void
  settleMs?: number
}

function cumulativeEnds(segments: TypewriterSegment[]) {
  const ends: number[] = []
  let c = 0
  for (const s of segments) {
    c += s.text.length
    ends.push(c)
  }
  return ends
}

export function TypewriterLine({
  segments,
  as: Comp = 'span',
  className = '',
  state,
  onComplete,
  charIntervalMs = 18,
  maxLineDurationMs,
  style,
  showCursor = true,
  settleMs = 380,
}: TypewriterLineProps) {
  const prefersReduced = useReducedMotion() ?? false
  const total = useMemo(() => segments.reduce((n, s) => n + s.text.length, 0), [segments])
  const ends = useMemo(() => cumulativeEnds(segments), [segments])
  const fullPlain = useMemo(() => segments.map((s) => s.text).join(''), [segments])

  const [count, setCount] = useState(0)
  const [segDone, setSegDone] = useState<boolean[]>(() => segments.map(() => false))
  const settledRef = useRef(false)

  useEffect(() => {
    setCount(0)
    setSegDone(segments.map(() => false))
    settledRef.current = false
  }, [segments])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const effectiveCharMs = useMemo(() => {
    if (total === 0) return charIntervalMs
    if (!maxLineDurationMs) return charIntervalMs
    return Math.min(charIntervalMs, maxLineDurationMs / total)
  }, [charIntervalMs, maxLineDurationMs, total])

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current)
      settleTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    clearTimers()
    settledRef.current = false

    if (prefersReduced || state === 'done') {
      setCount(total)
      setSegDone(segments.map(() => true))
      return
    }

    if (state === 'idle') {
      setCount(0)
      setSegDone(segments.map(() => false))
      return
    }

    if (state === 'running' && total === 0) {
      settleTimerRef.current = setTimeout(() => {
        if (!settledRef.current) {
          settledRef.current = true
          onComplete?.()
        }
      }, 0)
      return clearTimers
    }

    if (state === 'running') {
      setCount(0)
      setSegDone(segments.map(() => false))
      intervalRef.current = setInterval(() => {
        setCount((c) => {
          const n = Math.min(c + 1, total)
          if (n >= total && intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          return n
        })
      }, effectiveCharMs)
    }

    return clearTimers
  }, [state, total, segments, prefersReduced, effectiveCharMs, clearTimers, onComplete])

  useEffect(() => {
    if (prefersReduced || state !== 'running') return
    setSegDone((prev) => {
      const next = [...prev]
      let changed = false
      for (let i = 0; i < ends.length; i++) {
        const end = ends[i]!
        if (count >= end && !next[i]) {
          next[i] = true
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [count, ends, state, prefersReduced])

  useEffect(() => {
    if (prefersReduced || state !== 'running') return
    if (count < total || total === 0) return
    clearTimers()
    if (!settledRef.current) {
      settleTimerRef.current = setTimeout(() => {
        if (!settledRef.current) {
          settledRef.current = true
          onComplete?.()
        }
      }, settleMs)
    }
    return clearTimers
  }, [count, total, state, prefersReduced, settleMs, onComplete, clearTimers])

  let offset = 0
  const spans = segments.map((seg, i) => {
    const start = offset
    offset += seg.text.length
    const visible = Math.max(0, Math.min(seg.text.length, count - start))
    const slice = seg.text.slice(0, visible)
    const isAccent = seg.final === 'accent'
    const finalized = segDone[i] ?? false
    const colorStyle: CSSProperties = isAccent
      ? { color: FINAL.accent }
      : finalized
        ? {
            color: FINAL[seg.final],
            transition: 'color 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
          }
        : { color: PINK }

    return (
      <span key={i} style={colorStyle}>
        {slice}
      </span>
    )
  })

  const showCaret = showCursor && state === 'running' && count < total && total > 0

  const inner: ReactNode = (
    <>
      <span className="sr-only">{fullPlain}</span>
      <span aria-hidden className="inline">
        {spans}
        {showCaret ? (
          <span className="font-mono text-[0.95em] opacity-90" aria-hidden>
            ▌
          </span>
        ) : null}
      </span>
    </>
  )

  return createElement(Comp, { className, style }, inner)
}
