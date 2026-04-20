'use client'

import { m } from 'framer-motion'
import { CyberPanel } from '@/components/shared/CyberPanel'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { useMediaQuery } from '@/lib/use-media-query'

const RESUME_PATH = '/documents/Don-Laliberte-Resume.pdf'

export function ResumeSection() {
  // iOS Safari refuses to inline-render <iframe src="*.pdf"> — swap to a
  // call-to-action button on narrow viewports so users never see a blank box.
  const isMobile = useMediaQuery('(max-width: 767px)')

  return (
    <div className="flex flex-col">
      <SectionHeading
        eyebrow="Documentation"
        title="The"
        accent="Resume"
        subtitle="Full-stack developer. Full document below — download it, open it in a new tab, or read along."
      />

      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
        className="mt-8 flex flex-wrap gap-3"
      >
        <a
          href={RESUME_PATH}
          download="Don-Laliberte-Resume.pdf"
          className="btn-accent"
        >
          <DownloadIcon />
          Download PDF
        </a>
        <a
          href={RESUME_PATH}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-accent"
          style={{ background: 'transparent' }}
        >
          <ExternalIcon />
          Open in new tab
        </a>
      </m.div>

      <m.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.45 }}
        className="mt-8"
      >
        <CyberPanel className="overflow-hidden rounded-sm">
          {isMobile ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 p-8 text-center">
              <p className="font-tech text-sm uppercase tracking-[0.22em]" style={{ color: 'rgb(var(--accent))' }}>
                Mobile preview not supported
              </p>
              <p className="max-w-xs text-base leading-relaxed text-muted">
                iOS and mobile browsers can&apos;t inline-render PDFs. Use one
                of the buttons above to open or download the resume.
              </p>
              <a
                href={RESUME_PATH}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent mt-2"
              >
                <ExternalIcon />
                Open Resume
              </a>
            </div>
          ) : (
            <iframe
              src={`${RESUME_PATH}#view=FitH`}
              title="Don Laliberte Resume"
              className="block h-[68vh] w-full border-0"
              style={{ background: 'rgb(var(--bg-panel) / 0.6)' }}
              loading="lazy"
            />
          )}
        </CyberPanel>
      </m.div>
    </div>
  )
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}
