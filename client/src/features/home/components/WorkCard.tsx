'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRef, useState } from 'react'
import type { WorkProject } from '@/config/works'
import { CyberPanel } from '@/components/shared/CyberPanel'
import { MaskIcon } from '@/components/shared/MaskIcon'
import { useTheme } from '@/lib/theme-provider'

const WorkModal = dynamic(
  () => import('./WorkModal').then((m) => m.WorkModal),
  { ssr: false },
)

interface WorkCardProps {
  project: WorkProject
}

export function WorkCard({ project }: WorkCardProps) {
  const [open, setOpen] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)
  const hoverRef = useRef(false)
  const { theme } = useTheme()

  // Prefer a dark-mode variant if one is configured, otherwise fall back to
  // the default logo. Key the <object> by the resolved src so switching themes
  // re-mounts the SVG and replays its stroke-dash animation.
  const resolvedLogoSrc =
    theme === 'dark' && project.logoSrcDark ? project.logoSrcDark : project.logoSrc
  const isAnimatedLogo = resolvedLogoSrc?.includes('csus-logo')
  const logoW = project.logoWidth ?? 64
  const logoH = project.logoHeight ?? 64

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

        <div className="flex flex-1 flex-col">
          <h3
            className="mb-1 font-display text-2xl font-bold md:text-[1.7rem]"
            style={{ color: 'rgb(var(--text))' }}
          >
            {project.name}
          </h3>

          {(project.role || project.timeframe) && (
            <p
              className="mb-3 font-tech text-xs uppercase tracking-[0.22em]"
              style={{ color: 'rgb(var(--accent))' }}
            >
              {project.role}
              {project.role && project.timeframe ? ' · ' : ''}
              {project.timeframe}
            </p>
          )}

          <p className="mb-4 text-base leading-relaxed text-muted">
            {project.description}
          </p>

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
