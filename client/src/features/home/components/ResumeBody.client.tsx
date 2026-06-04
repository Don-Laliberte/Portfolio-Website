'use client'

import { m } from 'framer-motion'
import { CyberPanel } from '@/components/shared/CyberPanel'
import { ResumeOnePager } from './ResumeOnePager'

type ResumeBodyProps = {
  pdfPath: string
  pdfFilename: string
}

export function ResumeBody({ pdfPath, pdfFilename }: ResumeBodyProps) {
  return (
    <>
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
        className="mt-8 flex flex-wrap gap-3"
      >
        <a
          href={pdfPath}
          download={pdfFilename}
          className="btn-accent"
        >
          <DownloadIcon />
          Download PDF
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
          <ResumeOnePager embedded />
        </CyberPanel>
      </m.div>
    </>
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
