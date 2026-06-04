'use client'

import { m } from 'framer-motion'
import type { WorkProject } from '@/config/works'
import { WorkCard } from './WorkCard'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' as const } },
}

type WorksGridProps = {
  projects: WorkProject[]
}

export function WorksGrid({ projects }: WorksGridProps) {
  return (
    <m.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className="mt-10 grid gap-5 md:mt-12 md:grid-cols-2 md:gap-6"
    >
      {projects.map((project) => (
        <m.div key={project.id} variants={item}>
          <WorkCard project={project} />
        </m.div>
      ))}
    </m.div>
  )
}
