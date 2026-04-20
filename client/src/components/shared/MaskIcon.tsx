import type { CSSProperties } from 'react'

interface MaskIconProps {
  /** URL of an SVG (or any raster/vector alpha source) to use as the mask. */
  src: string
  /** Rendered size in pixels (square). Pass a non-square box via `style` if needed. */
  size?: number
  /** Tint color. Accepts any CSS color — including `rgb(var(--accent))` tokens. */
  color?: string
  /** Extra utility classes (e.g. transitions, hover opacity). */
  className?: string
  /** If provided, the span becomes `role="img"` with an accessible name. */
  label?: string
  /** Escape hatch for extra inline styles (e.g. `marginLeft`). */
  style?: CSSProperties
}

/**
 * MaskIcon — renders a monochrome icon whose color is fully controllable via
 * `background-color`. The source SVG becomes a mask, so the tint is always the
 * token color (light/dark-mode aware when you pass `rgb(var(--accent))`).
 *
 * Use this for SVGs that ship as solid-color marks (e.g. social brand glyphs
 * with `fill="currentColor"` that gets stripped when loaded via `<img>`).
 */
export function MaskIcon({
  src,
  size = 24,
  color = 'rgb(var(--accent))',
  className = '',
  label,
  style,
}: MaskIconProps) {
  const maskUrl = `url(${src})`
  return (
    <span
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      className={`inline-block shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        WebkitMaskImage: maskUrl,
        maskImage: maskUrl,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        ...style,
      }}
    />
  )
}
