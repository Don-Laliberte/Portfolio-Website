'use client'

import { m } from 'framer-motion'
import { useTheme } from '@/lib/theme-provider'

interface LogoProps {
  onHomeClick: () => void
}

export function Logo({ onHomeClick }: LogoProps) {
  const { theme } = useTheme()
  // Dark theme reads better against the light-background sprite (no border),
  // light theme needs the bordered variant to stand out on cream.
  const logoSrc = theme === 'dark' ? '/icons/donsprite.svg' : '/icons/donsprite-with-border.svg'

  return (
    <a
      href="#hero"
      onClick={(e) => {
        e.preventDefault()
        onHomeClick()
      }}
      className="group inline-flex items-center gap-3 rounded-md px-2 py-1 text-inherit no-underline"
      aria-label="Don Laliberte — Home"
    >
      <m.img
        src={logoSrc}
        alt=""
        width={42}
        height={77}
        className="pixelated block h-auto w-[32px] md:w-[40px]"
        whileHover={{ rotate: -8, scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        aria-hidden
      />
      <span
        className="font-display text-lg font-bold tracking-wide transition-colors duration-200 md:text-xl"
        style={{ color: 'rgb(var(--text))' }}
      >
        <span className="group-hover:[color:rgb(var(--accent-bright))]">Don Laliberte</span>
      </span>
    </a>
  )
}
