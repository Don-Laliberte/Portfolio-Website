import type { HTMLAttributes, ReactNode } from 'react'

interface FullPageSectionProps extends HTMLAttributes<HTMLElement> {
  id: string
  children: ReactNode
  /** Content max-width — narrow (720px), wide (1100px), full (no constraint). */
  width?: 'narrow' | 'wide' | 'full'
  /** Vertical alignment of the content block. */
  align?: 'start' | 'center'
  /** Optional radial tint color for subtle section variation. */
  tintColor?: string
}

const widthMap: Record<NonNullable<FullPageSectionProps['width']>, string> = {
  narrow: 'max-w-[720px]',
  wide: 'max-w-[1100px]',
  full: 'w-full',
}

export function FullPageSection({
  id,
  children,
  width = 'wide',
  align = 'center',
  tintColor,
  className = '',
  ...rest
}: FullPageSectionProps) {
  return (
    <section
      id={id}
      className={`fullpage-section relative w-full overflow-hidden ${className}`}
      {...rest}
    >
      {/* Layered gradient overlay — DonForPres-style subtle tint + fades */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: `
            linear-gradient(to bottom, rgb(var(--bg-ink) / 0.7) 0%, transparent 12rem),
            linear-gradient(to top, rgb(var(--bg-ink)) 0%, transparent 16rem),
            radial-gradient(ellipse at 80% 30%, ${tintColor ?? 'rgb(var(--glow-secondary) / 0.22)'} 0%, transparent 55%),
            radial-gradient(ellipse at 20% 85%, rgb(var(--glow) / 0.1) 0%, transparent 50%)
          `,
        }}
      />

      <div
        className={`fullpage-inner relative z-[4] mx-auto flex w-full flex-col ${
          align === 'center' ? 'justify-center' : 'justify-start'
        } px-5 py-24 sm:px-8 md:px-12 lg:px-16 ${widthMap[width]}`}
      >
        {children}
      </div>
    </section>
  )
}
