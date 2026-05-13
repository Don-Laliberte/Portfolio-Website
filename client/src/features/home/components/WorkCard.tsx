'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useInView, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { WorkProject } from '@/config/works'
import { CyberPanel } from '@/components/shared/CyberPanel'
import { MaskIcon } from '@/components/shared/MaskIcon'
import { TypewriterLine, type LineState, type TypewriterSegment } from '@/components/shared/TypewriterText'
import { useTheme } from '@/lib/theme-provider'

const WorkModal = dynamic(
  () => import('./WorkModal').then((m) => m.WorkModal),
  { ssr: false },
)

interface WorkCardProps {
  project: WorkProject
}

type TextStep = {
  key: string
  as: 'h3' | 'p'
  className: string
  style?: React.CSSProperties
  segments: TypewriterSegment[]
  charIntervalMs: number
  maxLineDurationMs: number
}

export function WorkCard({ project }: WorkCardProps) {
  const [open, setOpen] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)
  const hoverRef = useRef(false)
  const { theme } = useTheme()
  const copyRef = useRef<HTMLDivElement>(null)
  const inView = useInView(copyRef, { once: true, amount: 0.2 })
  const prefersReduced = useReducedMotion() ?? false
  const [lineIndex, setLineIndex] = useState(0)

  const resolvedLogoSrc =
    theme === 'dark' && project.logoSrcDark ? project.logoSrcDark : project.logoSrc
  const isAnimatedLogo = resolvedLogoSrc?.includes('csus-logo')
  const logoW = project.logoWidth ?? 64
  const logoH = project.logoHeight ?? 64

  const steps = useMemo((): TextStep[] => {
    const s: TextStep[] = [
      {
        key: 'name',
        as: 'h3',
        className: 'mb-1 font-display text-2xl font-bold md:text-[1.7rem]',
        style: { color: 'rgb(var(--text))' },
        segments: [{ text: project.name, final: 'text' }],
        charIntervalMs: 17,
        maxLineDurationMs: 900,
      },
    ]
    const roleLine = [project.role, project.timeframe].filter(Boolean).join(
      project.role && project.timeframe ? ' · ' : '',
    )
    if (roleLine) {
      s.push({
        key: 'role',
        as: 'p',
        className: 'mb-3 font-tech text-xs uppercase tracking-[0.22em]',
        style: { color: 'rgb(var(--accent))' },
        segments: [{ text: roleLine, final: 'accentToken' }],
        charIntervalMs: 15,
        maxLineDurationMs: 750,
      })
    }
    return s
  }, [project])

  const lineCount = steps.length

  useEffect(() => {
    if (!inView) return
    if (prefersReduced) setLineIndex(lineCount)
  }, [inView, prefersReduced, lineCount])

  const lineState = useCallback(
    (i: number): LineState => {
      if (!inView) return 'idle'
      if (prefersReduced) return 'done'
      if (i < lineIndex) return 'done'
      if (i === lineIndex) return 'running'
      return 'idle'
    },
    [inView, lineIndex, prefersReduced],
  )

  const onLineDone = useCallback(() => {
    setLineIndex((j) => Math.min(j + 1, lineCount))
  }, [lineCount])

  const handleMouseEnter = () => {
    if (!hoverRef.current && isAnimatedLogo) {
      hoverRef.current = true
      setAnimationKey((k) => k + 1)
    }
  }

  const handleMouseLeave = () => {
    hoverRef.current = false
  }

  return (
    <>
      <CyberPanel
        hover
        className="animated-logo-trigger flex h-full flex-col p-6"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {resolvedLogoSrc ? (
          <div className="work-logo mb-4 flex justify-center">
            {isAnimatedLogo ? (
              <object
                key={`${resolvedLogoSrc}-${animationKey}`}
                data={resolvedLogoSrc}
                type="image/svg+xml"
                className="animated-logo"
                aria-label={project.logoAlt ?? `${project.name} logo`}
                style={{
                  width: `${logoW}px`,
                  height: `${logoH}px`,
                  maxWidth: `${logoW}px`,
                  maxHeight: `${logoH}px`,
                }}
              />
            ) : (
              <Image
                key={resolvedLogoSrc}
                src={resolvedLogoSrc}
                alt={project.logoAlt ?? `${project.name} logo`}
                width={logoW}
                height={logoH}
                style={{
                  width: `${logoW}px`,
                  height: `${logoH}px`,
                  maxWidth: `${logoW}px`,
                  maxHeight: `${logoH}px`,
                  objectFit: 'contain',
                }}
              />
            )}
          </div>
        ) : null}

        <div ref={copyRef} className="flex flex-1 flex-col">
          {steps.map((step, i) => {
            const Comp = step.as
            return (
              <Comp key={step.key} className={step.className} style={step.style}>
                <TypewriterLine
                  segments={step.segments}
                  state={lineState(i)}
                  onComplete={onLineDone}
                  charIntervalMs={step.charIntervalMs}
                  maxLineDurationMs={step.maxLineDurationMs}
                  settleMs={320}
                  showCursor={lineIndex === i}
                />
              </Comp>
            )
          })}

          <p className="mb-4 text-base leading-relaxed text-muted">{project.description}</p>

          {project.tech && project.tech.length > 0 ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <span key={tech} className="tech-chip">
                  {tech}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-auto flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="view-more-btn group/view inline-flex items-center gap-1.5 font-tech text-sm uppercase tracking-[0.2em]"
            >
              View more
              <span
                aria-hidden
                className="view-more-arrow inline-block transition-transform duration-200"
              >
                →
              </span>
            </button>
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${project.name} website`}
                className="worklink-btn inline-flex h-11 w-11 items-center justify-center rounded-sm"
              >
                <MaskIcon
                  src="/icons/link.svg"
                  size={18}
                  color="rgb(var(--accent))"
                  className="worklink-icon"
                />
              </a>
            ) : null}
          </div>
        </div>
      </CyberPanel>

      <WorkModal open={open} onClose={() => setOpen(false)} project={project} />
    </>
  )
}
