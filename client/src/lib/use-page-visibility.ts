'use client'

import { useCallback, useSyncExternalStore } from 'react'

const emptySubscribe = () => () => undefined

/**
 * Tracks `document.visibilityState === 'visible'`.
 * Assumes visible on the server so hydration matches an active tab.
 */
export function usePageVisibility(): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    if (typeof document === 'undefined') return () => undefined
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  const getSnapshot = useCallback(() => {
    if (typeof document === 'undefined') return true
    return document.visibilityState === 'visible'
  }, [])

  const getServerSnapshot = () => true

  return useSyncExternalStore(
    typeof document === 'undefined' ? emptySubscribe : subscribe,
    getSnapshot,
    getServerSnapshot,
  )
}
