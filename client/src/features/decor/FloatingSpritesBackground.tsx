'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const FloatingSpritesScene = dynamic(
  () => import('./FloatingSpritesScene'),
  { ssr: false },
)

type ViewportTier = {
  slotCount: number
  spritePx: number
  dprMax: number
}

/** Tiered budget so phones get a smaller, lighter field than desktops. */
function computeTier(width: number): ViewportTier {
  if (width < 640) return { slotCount: 5, spritePx: 60, dprMax: 1.25 }
  if (width < 1024) return { slotCount: 8, spritePx: 90, dprMax: 1.5 }
  return { slotCount: 11, spritePx: 135, dprMax: 1.5 }
}

function useViewportTier(): ViewportTier {
  const [tier, setTier] = useState<ViewportTier>(() =>
    computeTier(typeof window === 'undefined' ? 1280 : window.innerWidth),
  )

  useEffect(() => {
    const sync = () => {
      const next = computeTier(window.innerWidth)
      setTier((prev) =>
        prev.slotCount === next.slotCount &&
        prev.spritePx === next.spritePx &&
        prev.dprMax === next.dprMax
          ? prev
          : next,
      )
    }
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

  return tier
}

export function FloatingSpritesBackground() {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [reducedData, setReducedData] = useState(false)
  const [pageVisible, setPageVisible] = useState(
    () => typeof document !== 'undefined' && document.visibilityState === 'visible',
  )
  const tier = useViewportTier()

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-data: reduce)')
    const sync = () => setReducedData(mq.matches)
    sync()
    // Older browsers (esp. Safari < 17) don't support addEventListener on
    // MediaQueryList; guard with optional chaining.
    mq.addEventListener?.('change', sync)
    return () => mq.removeEventListener?.('change', sync)
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

  if (reducedData) return null

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
        <FloatingSpritesScene
          active={pageVisible}
          reducedMotion={reducedMotion}
          slotCount={tier.slotCount}
          spritePx={tier.spritePx}
          dprMax={tier.dprMax}
        />
      </div>
    </div>
  )
}
