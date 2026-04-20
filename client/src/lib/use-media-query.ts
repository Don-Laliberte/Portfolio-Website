'use client'

import { useCallback, useSyncExternalStore } from 'react'

const emptySubscribe = () => () => undefined

/**
 * Subscribe to a CSS media query using the canonical external-store pattern.
 * Returns false on the server. Safe across Safari 13/old WebView too —
 * addListener/removeListener is used when addEventListener is missing.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === 'undefined') return () => undefined
      const mql = window.matchMedia(query)
      if (mql.addEventListener) {
        mql.addEventListener('change', onChange)
        return () => mql.removeEventListener('change', onChange)
      }
      mql.addListener(onChange)
      return () => mql.removeListener(onChange)
    },
    [query],
  )

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  }, [query])

  const getServerSnapshot = () => false

  return useSyncExternalStore(
    typeof window === 'undefined' ? emptySubscribe : subscribe,
    getSnapshot,
    getServerSnapshot,
  )
}
