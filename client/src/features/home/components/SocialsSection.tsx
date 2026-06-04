import { SectionHeading } from '@/components/shared/SectionHeading'
import { SOCIALS } from '@/config/socials'
import { SocialsGrid } from './SocialsGrid.client'

export function SocialsSection() {
  return (
    <div className="flex flex-col">
      <SectionHeading
        eyebrow="Socials"
        title="Find me"
        accent="Online"
        subtitle="Here are some of the best places to reach me. Feel free to connect or chat."
      />

      <SocialsGrid socials={SOCIALS} />
    </div>
  )
}
