'use client'

import dynamic from 'next/dynamic'
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { m } from 'framer-motion'
import { useMediaQuery } from '@/lib/use-media-query'
import { usePageVisibility } from '@/lib/use-page-visibility'

const portraitIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: 'easeOut' as const, delay: 0.2 },
  },
}

const IN_VIEW_THRESHOLD = 0.1

const HeroLaptopScene = dynamic(
  () => import('./HeroLaptopScene'),
  { ssr: false, loading: () => <HeroLaptopLoading /> },
)

function HeroLaptopLoading() {
  return (
    <div
      className="flex h-full w-full items-center justify-center font-tech text-xs uppercase tracking-[0.2em] text-muted opacity-40"
      aria-hidden
    >
      Loading…
    </div>
  )
}

function isElementInView(el: HTMLElement, threshold: number): boolean {
  const rect = el.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return false

  const vh = window.innerHeight
  const vw = window.innerWidth
  const visibleHeight = Math.min(rect.bottom, vh) - Math.max(rect.top, 0)
  const visibleWidth = Math.min(rect.right, vw) - Math.max(rect.left, 0)
  if (visibleHeight <= 0 || visibleWidth <= 0) return false

  const visibleArea = visibleHeight * visibleWidth
  const totalArea = rect.width * rect.height
  return visibleArea / totalArea >= threshold
}

export function HeroLaptop() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [replayKey, setReplayKey] = useState(0)
  const [inView, setInView] = useState(false)
  const leftViewRef = useRef(false)

  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const pageVisible = usePageVisibility()

  // Warm the JS chunk, GLB, and headshot on mount so first paint and
  // scroll-back to the hero stay responsive. fetch/Image prime HTTP cache
  // before HeroLaptopScene's useLoader / useGLTF run.
  useEffect(() => {
    void import('./HeroLaptopScene')
    void fetch('/models/portfolio-laptop.glb')

    const headshot = new Image()
    headshot.src = '/images/don-headshot.jpg'
  }, [])

  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return

    let cancelled = false

    const raf = requestAnimationFrame(() => {
      if (cancelled) return
      if (isElementInView(el, IN_VIEW_THRESHOLD)) {
        setInView(true)
      }
    })

    const inViewIo = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (!entry.isIntersecting) {
          setInView(false)
          leftViewRef.current = true
          return
        }
        setInView(true)
        if (leftViewRef.current) {
          setReplayKey((k) => k + 1)
          leftViewRef.current = false
        }
      },
      { threshold: IN_VIEW_THRESHOLD },
    )

    inViewIo.observe(el)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      inViewIo.disconnect()
    }
  }, [])

  return (
    <m.div
      variants={portraitIn}
      ref={rootRef}
      className="relative mx-auto aspect-[4/3] w-[min(100%,460px)] shrink-0 sm:w-[min(100%,540px)] md:w-[min(100%,620px)] xl:mx-0 xl:w-[min(580px,48vw)] xl:max-w-[52%] xl:flex-shrink-0 2xl:w-[min(640px,46vw)]"
      aria-label="Animated laptop with portrait on screen"
    >
      <Suspense fallback={<HeroLaptopLoading />}>
        <HeroLaptopScene
          replayKey={replayKey}
          reducedMotion={reducedMotion}
          soundEnabled={!reducedMotion}
          runnerActive={inView && pageVisible}
        />
      </Suspense>
    </m.div>
  )
}
