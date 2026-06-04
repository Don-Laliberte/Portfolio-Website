'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useMediaQuery } from '@/lib/use-media-query'
import { usePageVisibility } from '@/lib/use-page-visibility'

const FloatingSpritesScene = dynamic(
  () => import('./FloatingSpritesScene'),
  { ssr: false },
)

/** Let the hero laptop claim the GPU first before mounting a second WebGL context. */
const MIN_CANVAS_DEFER_MS = 400
/** Mount sprites once idle, but don't wait forever on a busy main thread. */
const IDLE_CALLBACK_TIMEOUT_MS = 1500

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

function useDeferredCanvasMount(): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void import('./FloatingSpritesScene')

    let cancelled = false
    let idleId: number | undefined

    const enableCanvas = () => {
      if (!cancelled) setReady(true)
    }

    const minDeferTimer = window.setTimeout(() => {
      if (cancelled) return
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(enableCanvas, {
          timeout: IDLE_CALLBACK_TIMEOUT_MS,
        })
        return
      }
      enableCanvas()
    }, MIN_CANVAS_DEFER_MS)

    return () => {
      cancelled = true
      window.clearTimeout(minDeferTimer)
      if (idleId !== undefined && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId)
      }
    }
  }, [])

  return ready
}

export function FloatingSpritesBackground() {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const reducedData = useMediaQuery('(prefers-reduced-data: reduce)')
  const pageVisible = usePageVisibility()
  const canvasReady = useDeferredCanvasMount()
  const tier = useViewportTier()

  // Reading-area fade: sprites stay fully visible toward the page edges and
  // are obscured through the central reading column so they can't compete with
  // body / heading text (especially pink-on-pink in light theme).
  //
  // Previously implemented with CSS `mask-image` on this wrapper. Firefox
  // software-composites masks over animating WebGL content, which forced a
  // full re-mask of the viewport every frame the sprites moved. Replacing the
  // mask with a static gradient overlay painted in the page background colour
  // keeps the same visual (sprites fade into the background through the
  // centre) but lets Firefox cache a single gradient bitmap and skip the
  // per-frame masking pass entirely. Chromium/Safari are unaffected.
  const READING_OVERLAY =
    'radial-gradient(ellipse 58% 72% at 50% 48%,' +
    ' rgb(var(--bg-ink) / 0.88) 0%,' +
    ' rgb(var(--bg-ink) / 0.45) 38%,' +
    ' rgb(var(--bg-ink) / 0) 78%)'

  if (reducedData) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 motion-reduce:opacity-60"
    >
      <div className="h-full min-h-[100dvh] w-full">
        {canvasReady ? (
          <div
            className={`h-full w-full animate-sprite-canvas-in ${
              reducedMotion ? 'motion-reduce:animate-none motion-reduce:opacity-100' : ''
            }`}
          >
            <FloatingSpritesScene
              active={pageVisible}
              reducedMotion={reducedMotion}
              slotCount={tier.slotCount}
              spritePx={tier.spritePx}
              dprMax={tier.dprMax}
            />
          </div>
        ) : null}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: READING_OVERLAY }}
      />
    </div>
  )
}
