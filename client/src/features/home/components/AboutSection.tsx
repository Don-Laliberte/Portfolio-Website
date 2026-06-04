import { SectionHeading } from '@/components/shared/SectionHeading'
import { ABOUT_BLOCKS } from '@/config/about'
import { AboutBlocks } from './AboutBlocks.client'

export function AboutSection() {
  return (
    <div className="flex flex-col">
      <SectionHeading
        eyebrow="Who am I?"
        title="Don"
        accent="Laliberte"
        subtitle="Computer Science student at the University of Calgary. I'm passionate about our growing community and creating the impact I want to see with my work."
      />
      <AboutBlocks blocks={ABOUT_BLOCKS} />
    </div>
  )
}
