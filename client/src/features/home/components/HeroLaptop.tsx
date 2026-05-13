'use client'

import dynamic from 'next/dynamic'
import { Suspense, useEffect, useRef, useState } from 'react'
import { m } from 'framer-motion'

const portraitIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: 'easeOut' as const, delay: 0.2 },
  },
}

const HeroLaptopScene = dynamic(
  () => import('./HeroLaptopScene'),
  { ssr: false, loading: () => <HeroLaptopFallback /> },
)

function HeroLaptopFallback() {
  return (
    <div
      className="flex h-full w-full items-center justify-center font-tech text-xs uppercase tracking-[0.2em] opacity-40"
      style={{ color: 'rgb(var(--text) / 0.6)' }}
      aria-hidden
    >
      Loading…
    </div>
  )
}

export function HeroLaptop() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [replayKey, setReplayKey] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  // Seed true so the laptop renders on first paint even if IntersectionObserver
  // hasn't fired yet (avoids a blank canvas on slow / production-only timing).
  const [inView, setInView] = useState(true)
  const [pageVisible, setPageVisible] = useState(
    () => typeof document !== 'undefined' && document.visibilityState === 'visible',
  )
  const leftViewRef = useRef(false)

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

  useEffect(() => {
    const el = rootRef.current
    if (!el) return

    const io = new IntersectionObserver(
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
      { threshold: 0.1 },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <m.div
      variants={portraitIn}
      ref={rootRef}
      className="relative mx-auto aspect-[4/3] w-[min(100%,460px)] shrink-0 sm:w-[min(100%,540px)] md:w-[min(100%,620px)] xl:mx-0 xl:w-[min(580px,48vw)] xl:max-w-[52%] xl:flex-shrink-0 2xl:w-[min(640px,46vw)]"
      aria-label="Animated laptop with portrait on screen"
    >
      <Suspense fallback={<HeroLaptopFallback />}>
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
