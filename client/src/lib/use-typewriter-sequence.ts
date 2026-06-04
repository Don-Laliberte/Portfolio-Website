'use client'

import { useReducedMotion } from 'framer-motion'
import { useCallback, useState } from 'react'
import type { LineState } from '@/components/shared/TypewriterText'

type UseTypewriterSequenceOptions = {
  lineCount: number
  /** When false, every line stays idle until activated (e.g. inView or mounted). */
  active?: boolean
}

export function useTypewriterSequence({
  lineCount,
  active = true,
}: UseTypewriterSequenceOptions) {
  const prefersReduced = useReducedMotion() ?? false
  const skipAnimation = prefersReduced
  const [lineIndex, setLineIndex] = useState(0)

  const lineState = (i: number): LineState => {
    if (!active) return 'idle'
    if (skipAnimation) return 'done'
    if (i < lineIndex) return 'done'
    if (i === lineIndex) return 'running'
    return 'idle'
  }

  // Stable reference — TypewriterLine lists onComplete in effect deps.
  const onLineDone = useCallback(() => {
    setLineIndex((j) => Math.min(j + 1, lineCount))
  }, [lineCount])

  const showCursor = (i: number) => active && !skipAnimation && lineIndex === i

  const isComplete = active && (skipAnimation || lineIndex >= lineCount)

  return { lineIndex, lineState, onLineDone, showCursor, isComplete }
}
