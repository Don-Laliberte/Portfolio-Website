'use client'

import dynamic from 'next/dynamic'
import { m } from 'framer-motion'
import { useCallback, useState } from 'react'
import type { WorkProject } from '@/config/works'
import { WorkCard } from './WorkCard'

const WorkModal = dynamic(
  () => import('./WorkModal').then((m) => m.WorkModal),
  { ssr: false },
)

const preloadWorkModal = () => {
  void import('./WorkModal')
}

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
  const [modalMounted, setModalMounted] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<WorkProject | null>(null)

  const handleViewMore = useCallback((project: WorkProject) => {
    setModalMounted(true)
    setSelectedProject(project)
    setModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
  }, [])

  return (
    <>
      <m.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="mt-10 grid gap-5 md:mt-12 md:grid-cols-2 md:gap-6"
      >
        {projects.map((project) => (
          <m.div key={project.id} variants={item}>
            <WorkCard
              project={project}
              onViewMore={() => handleViewMore(project)}
              onViewMoreIntent={preloadWorkModal}
            />
          </m.div>
        ))}
      </m.div>

      {modalMounted && selectedProject ? (
        <WorkModal
          open={modalOpen}
          onClose={handleCloseModal}
          project={selectedProject}
        />
      ) : null}
    </>
  )
}
