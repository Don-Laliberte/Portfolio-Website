'use client'

import { useSyncExternalStore } from 'react'

/**
 * Shared "is the user actively scrolling the main scroll-container right now?"
 * signal. We expose it as a `useSyncExternalStore` hook so multiple consumers
 * share a single passive scroll listener, and side-effect a `is-scrolling`
 * class onto `body` so plain CSS (sticky navbar blur, cyber-panel blur, scan
 * line) can degrade gracefully without re-rendering React trees.
 *
 * Firefox's compositor stalls when stacking `backdrop-filter`, a full-viewport
 * fixed WebGL canvas, and `scroll-snap-type: mandatory` simultaneously; the
 * goal here is to drop the expensive layers during the brief window the user
 * is moving the scroller, then restore them on settle.
 */

/** Quiet window after the last scroll event before we consider scrolling stopped. */
const SETTLE_MS = 150

const listeners = new Set<() => void>()
let isScrolling = false
let container: HTMLElement | null = null
let scrollHandler: (() => void) | null = null
let settleTimer: number | null = null
let attachRaf: number | null = null
let subscriberCount = 0

function getBody(): HTMLElement | null {
  if (typeof document === 'undefined') return null
  return document.body
}

function setScrolling(next: boolean) {
  if (isScrolling === next) return
  isScrolling = next
  const body = getBody()
  if (body) {
    if (next) body.classList.add('is-scrolling')
    else body.classList.remove('is-scrolling')
  }
  for (const l of listeners) l()
}

function attach() {
  if (scrollHandler || typeof document === 'undefined') return
  const el = document.querySelector<HTMLElement>('.scroll-container')
  if (!el) {
    // Container not mounted yet; try again next frame. Common during the
    // first render before MainLayout's children commit.
    attachRaf = requestAnimationFrame(attach)
    return
  }
  attachRaf = null
  container = el
  scrollHandler = () => {
    setScrolling(true)
    if (settleTimer !== null) window.clearTimeout(settleTimer)
    settleTimer = window.setTimeout(() => {
      settleTimer = null
      setScrolling(false)
    }, SETTLE_MS)
  }
  el.addEventListener('scroll', scrollHandler, { passive: true })
}

function detach() {
  if (attachRaf !== null) {
    cancelAnimationFrame(attachRaf)
    attachRaf = null
  }
  if (container && scrollHandler) {
    container.removeEventListener('scroll', scrollHandler)
  }
  if (settleTimer !== null) {
    window.clearTimeout(settleTimer)
    settleTimer = null
  }
  scrollHandler = null
  container = null
  if (isScrolling) {
    isScrolling = false
    getBody()?.classList.remove('is-scrolling')
  }
}

function subscribe(onChange: () => void) {
  if (subscriberCount === 0) attach()
  subscriberCount += 1
  listeners.add(onChange)
  return () => {
    listeners.delete(onChange)
    subscriberCount -= 1
    if (subscriberCount === 0) detach()
  }
}

function getSnapshot() {
  return isScrolling
}

function getServerSnapshot() {
  return false
}

export function useScrollContainerScrolling(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
