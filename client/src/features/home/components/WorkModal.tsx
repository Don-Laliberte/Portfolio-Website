'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { AnimatePresence, m } from 'framer-motion'
import type { WorkProject } from '@/config/works'

interface WorkModalProps {
  open: boolean
  onClose: () => void
  project: WorkProject
}

export function WorkModal({ open, onClose, project }: WorkModalProps) {
  const [currentImage, setCurrentImage] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    previouslyFocused.current = document.activeElement as HTMLElement | null
    document.body.classList.add('modal-open')

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), iframe, input, select, textarea',
      )
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    // Focus first element after the open animation starts.
    const t = window.setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(
        'button, a[href], [tabindex]:not([tabindex="-1"])',
      )
      first?.focus()
    }, 40)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(t)
      document.body.classList.remove('modal-open')
      previouslyFocused.current?.focus?.()
    }
  }, [open, onClose])

  if (typeof document === 'undefined') return null

  const images = project.images ?? []
  const hasImages = images.length > 0
  const hasMultiple = images.length > 1
  const description = project.extendedDescription || project.description
  const modalTech = project.modalTech ?? project.tech

  const content = (
    <AnimatePresence>
      {open ? (
        <m.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
          style={{
            background: 'rgb(0 0 0 / 0.82)',
            WebkitBackdropFilter: 'blur(8px)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={onClose}
        >
          <m.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="work-modal-title"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="cyber-panel cyber-panel-stripe modal-panel flex max-h-[90vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-sm"
          >
            <header
              className="flex flex-shrink-0 items-center justify-between gap-4 px-6 pt-6 pb-3"
            >
              <h2
                id="work-modal-title"
                className="font-display text-2xl font-bold md:text-3xl heading-glow"
                style={{ color: 'rgb(var(--text))' }}
              >
                {project.name}
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="modal-icon-btn inline-flex h-11 w-11 items-center justify-center rounded-sm"
              >
                <CloseIcon />
              </button>
            </header>

            <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
              {/* Content column */}
              <div className="order-2 min-h-0 flex-1 overflow-y-auto px-6 pb-6 md:order-1">
                {(project.role || project.timeframe) && (
                  <p
                    className="mb-4 font-tech text-xs uppercase tracking-[0.22em]"
                    style={{ color: 'rgb(var(--accent))' }}
                  >
                    {project.role}
                    {project.role && project.timeframe ? ' · ' : ''}
                    {project.timeframe}
                  </p>
                )}

                <p className="mb-5 text-base leading-relaxed text-muted">{description}</p>

                {modalTech && modalTech.length > 0 ? (
                  <div className="mb-6 flex flex-wrap gap-2">
                    {modalTech.map((tech) => (
                      <span key={tech} className="tech-chip">
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : null}

                {(project.liveUrl || project.repoUrl) && (
                  <div className="flex flex-wrap gap-3">
                    {project.liveUrl ? (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-accent"
                      >
                        <LinkIcon />
                        Open site
                      </a>
                    ) : null}
                    {project.repoUrl ? (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-accent"
                        style={{ background: 'transparent' }}
                      >
                        <CodeIcon />
                        View code
                      </a>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Carousel column */}
              {hasImages ? (
                <div className="order-1 flex-shrink-0 px-6 pb-6 md:order-2 md:w-[42%] md:min-w-[320px]">
                  <div
                    className="relative flex min-h-[240px] flex-1 flex-col overflow-hidden rounded-sm"
                    style={{
                      background: 'rgb(var(--bg-panel) / 0.35)',
                      border: '1px solid rgb(var(--border-muted) / var(--border-muted-alpha))',
                    }}
                  >
                    <div className="relative h-full min-h-[240px] w-full">
                      <Image
                        src={images[currentImage]}
                        alt={`${project.name} — image ${currentImage + 1}`}
                        width={800}
                        height={600}
                        style={{ width: '100%', height: '100%', minHeight: '240px', objectFit: 'contain' }}
                      />
                    </div>

                    {hasMultiple ? (
                      <>
                        <button
                          type="button"
                          aria-label="Previous image"
                          onClick={() =>
                            setCurrentImage((i) => (i - 1 + images.length) % images.length)
                          }
                          className="modal-chevron-btn absolute left-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-sm"
                        >
                          <ChevronLeft />
                        </button>
                        <button
                          type="button"
                          aria-label="Next image"
                          onClick={() => setCurrentImage((i) => (i + 1) % images.length)}
                          className="modal-chevron-btn absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-sm"
                        >
                          <ChevronRight />
                        </button>
                      </>
                    ) : null}
                  </div>
                  {hasMultiple ? (
                    <div className="mt-3 flex justify-center gap-2">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          aria-label={`Go to image ${i + 1}`}
                          onClick={() => setCurrentImage(i)}
                          className="h-2 w-2 rounded-full transition-transform"
                          style={{
                            background:
                              i === currentImage
                                ? 'rgb(var(--accent-bright))'
                                : 'rgb(var(--text) / 0.35)',
                            transform: i === currentImage ? 'scale(1.15)' : undefined,
                          }}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </m.div>
        </m.div>
      ) : null}
    </AnimatePresence>
  )

  return createPortal(content, document.body)
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function ChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <span
      className="relative block h-[14px] w-[14px] shrink-0 overflow-hidden [image-rendering:pixelated]"
      aria-hidden
    >
      <img
        src="/icons/link.svg"
        alt=""
        width={14}
        height={14}
        className="block h-full w-full max-w-none object-contain [image-rendering:pixelated]"
        draggable={false}
      />
    </span>
  )
}

function CodeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}
