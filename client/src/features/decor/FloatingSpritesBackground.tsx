'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const FloatingSpritesScene = dynamic(
  () => import('./FloatingSpritesScene'),
  { ssr: false },
)

export function FloatingSpritesBackground() {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [pageVisible, setPageVisible] = useState(
    () => typeof document !== 'undefined' && document.visibilityState === 'visible',
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const onVis = () => setPageVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // Radial mask: sprites stay fully visible toward the page edges and fade
  // through the central reading column so they can't compete with body /
  // heading text (especially pink-on-pink in light theme).
  const READING_MASK =
    'radial-gradient(ellipse 58% 72% at 50% 48%, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,1) 78%)'

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 motion-reduce:opacity-60"
      style={{
        maskImage: READING_MASK,
        WebkitMaskImage: READING_MASK,
      }}
    >
      <div className="h-full min-h-[100dvh] w-full">
        <FloatingSpritesScene active={pageVisible} reducedMotion={reducedMotion} />
      </div>
    </div>
  )
}
