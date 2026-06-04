import { SectionHeading } from '@/components/shared/SectionHeading'
import { RESUME_PDF_FILENAME, RESUME_PDF_PATH } from '@/config/resume'
import { ResumeBody } from './ResumeBody.client'

export function ResumeSection() {
  return (
    <div className="flex flex-col">
      <SectionHeading
        eyebrow="Documentation"
        title="The"
        accent="Resume"
        subtitle="A SWE one-pager is embedded below for your ease of viewing. Check it out, and if you'd like you can download my official resume as a PDF as well!"
      />

      <ResumeBody pdfPath={RESUME_PDF_PATH} pdfFilename={RESUME_PDF_FILENAME} />
    </div>
  )
}
