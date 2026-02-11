'use client'

import { Box, useColorModeValue } from '@chakra-ui/react'
import { WORK_PROJECTS } from '@/config/works'
import { WorkCard } from './WorkCard'

export function WorksSection() {
  const headingColor = useColorModeValue('heart.charcoal', 'heart.darkText')
  const subtextColor = useColorModeValue('heart.gray', 'heart.darkTextMuted')

  return (
    <Box>
      <Box textAlign="center" mb={6} pt={2}>
        <Box
          as="h2"
          fontFamily="var(--font-heading)"
          fontSize={{ base: '1.75rem', md: '2.25rem' }}
          fontWeight="600"
          color={headingColor}
          mb={2}
        >
          Works
        </Box>
        <Box as="p" color={subtextColor} fontSize="1.25rem" fontFamily="var(--font-body)">
          Some things I&apos;ve built and worked on.
        </Box>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
        gap={6}
      >
        {WORK_PROJECTS.map((project) => (
          <WorkCard key={project.id} project={project} />
        ))}
      </Box>
    </Box>
  )
}

