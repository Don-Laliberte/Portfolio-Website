import { SectionHeading } from '@/components/shared/SectionHeading'
import { WORK_PROJECTS } from '@/config/works'
import { WorksGrid } from './WorksGrid.client'

export function WorksSection() {
  return (
    <div className="flex flex-col">
      <SectionHeading
        eyebrow="Portfolio"
        title="Selected"
        accent="Works"
        subtitle="Take a look at some of my public work! Open any card for a more detailed look."
      />

      <WorksGrid projects={WORK_PROJECTS} />
    </div>
  )
}
