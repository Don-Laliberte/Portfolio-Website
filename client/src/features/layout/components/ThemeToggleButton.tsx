'use client'

import { useTheme } from '@/lib/theme-provider'

const TOGGLE_IMG_W = 44
const TOGGLE_IMG_H = 44

export function ThemeToggleButton() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggle}
      className="theme-toggle-btn group inline-flex items-center gap-2 rounded-sm border-0 bg-transparent p-0 text-[rgb(var(--text)/0.45)] outline-none transition-[color,transform] hover:text-[rgb(var(--accent-bright))] focus-visible:text-[rgb(var(--accent-bright))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-bright)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg-ink))] active:scale-[0.98] md:min-h-[44px]"
    >
      <ThemeToggleArt isOn={isDark} />
      {isDark ? (
        <MoonHintIcon className="shrink-0" />
      ) : (
        <SunHintIcon className="shrink-0" />
      )}
    </button>
  )
}

/** Pixel toggle: off = light theme, on = dark theme. */
function ThemeToggleArt({ isOn }: { isOn: boolean }) {
  const src = isOn ? '/icons/theme-toggle-on.svg' : '/icons/theme-toggle-off.svg'
  return (
    <span
      className="relative block shrink-0 overflow-hidden [image-rendering:pixelated]"
      style={{ width: TOGGLE_IMG_W, height: TOGGLE_IMG_H }}
      aria-hidden
    >
      <img
        src={src}
        alt=""
        width={TOGGLE_IMG_W}
        height={TOGGLE_IMG_H}
        className="block h-full w-full max-w-none object-contain [image-rendering:pixelated]"
        draggable={false}
      />
    </span>
  )
}

/** Shown in dark mode: current theme is dark. */
function MoonHintIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

/** Shown in light mode: current theme is light. */
function SunHintIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}
