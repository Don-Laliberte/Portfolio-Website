'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

export type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export const THEME_STORAGE_KEY = 'don-theme'

/**
 * Inline script string — inject via next/script strategy="beforeInteractive"
 * or directly in <head>. It resolves theme from localStorage or
 * prefers-color-scheme before React hydrates, so there's no flash.
 */
export const themeInitScript = `
(function() {
  try {
    var key = '${THEME_STORAGE_KEY}';
    var stored = localStorage.getItem(key);
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored === 'light' || stored === 'dark' ? stored : (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`.trim()

/**
 * External store: subscribes to attribute mutations on <html data-theme=...>
 * so theme reads go directly to the DOM (matches what the inline init script
 * wrote pre-hydration). Avoids useEffect + setState cascades.
 */
function subscribeToTheme(onChange: () => void) {
  if (typeof document === 'undefined') return () => undefined
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

function getThemeSnapshot(): Theme {
  if (typeof document === 'undefined') return 'dark'
  const attr = document.documentElement.getAttribute('data-theme')
  return attr === 'light' ? 'light' : 'dark'
}

function getThemeServerSnapshot(): Theme {
  return 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getThemeServerSnapshot)

  const setTheme = useCallback((next: Theme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next)
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // localStorage blocked (Safari private mode) — ignore.
    }
  }, [])

  const toggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const value = useMemo(() => ({ theme, toggle, setTheme }), [theme, toggle, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>')
  }
  return ctx
}
