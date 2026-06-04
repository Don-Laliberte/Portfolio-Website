import { SectionHeading } from '@/components/shared/SectionHeading'
import { ENDORSEMENTS } from '@/config/endorsements'
import { EndorsementsGrid } from './EndorsementsGrid.client'

export function EndorsementsSection() {
  return (
    <div className="flex flex-col">
      <SectionHeading
        eyebrow="Dev Community"
        title="Shoutouts"
        subtitle="These are some other cool people and some sites that I think are worth checking out <3"
      />

      {ENDORSEMENTS.length > 0 ? (
        <EndorsementsGrid endorsements={ENDORSEMENTS} />
      ) : (
        <p className="mt-10 max-w-md font-body text-base text-muted">
          More to come soon.
        </p>
      )}
    </div>
  )
}
