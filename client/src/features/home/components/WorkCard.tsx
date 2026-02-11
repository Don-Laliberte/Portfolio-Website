'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Box, useColorModeValue, useDisclosure } from '@chakra-ui/react'
import type { WorkProject } from '@/config/works'
import { WorkModal } from './WorkModal'

interface WorkCardProps {
  project: WorkProject
}

export function WorkCard({ project }: WorkCardProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [animationKey, setAnimationKey] = useState(0)
  const hoverRef = useRef(false)
  const cardBg = useColorModeValue('heart.uiBg', 'heart.darkPanel')
  const cardBorder = useColorModeValue('heart.uiBorder', 'heart.darkBorder')
  const headingColor = useColorModeValue('heart.charcoal', 'heart.darkText')
  const subtextColor = useColorModeValue('heart.gray', 'heart.darkTextMuted')
  const techBg = useColorModeValue('heart.pinkLight', 'heart.darkPanel')
  const techColor = useColorModeValue('heart.charcoal', 'heart.darkText')

  const isAnimatedLogo = project.logoSrc?.includes('csus-logo')
  const logoW = project.logoWidth ?? 64
  const logoH = project.logoHeight ?? 64

  const handleMouseEnter = () => {
    if (!hoverRef.current && isAnimatedLogo) {
      hoverRef.current = true
      setAnimationKey((prev) => prev + 1)
    }
  }

  const handleMouseLeave = () => {
    hoverRef.current = false
  }

  return (
    <Box
      className="heart-card"
      bg={cardBg}
      border="3px solid"
      borderColor={cardBorder}
      borderRadius="8px"
      p={6}
      boxShadow="0 4px 16px rgba(74,77,106,0.12)"
      position="relative"
      display="flex"
      flexDirection="column"
      transition="all 0.2s"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      _hover={{
        borderColor: 'heart.magenta',
        boxShadow: '0 6px 24px rgba(217,26,122,0.2)',
        transform: 'translateY(-2px)',
      }}
      _dark={{
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      }}
    >
      {project.logoSrc && (
        <Box className="work-card-logo" mb={4} display="flex" justifyContent="center">
          {isAnimatedLogo ? (
            <Box
              as="object"
              key={`${project.logoSrc}-${animationKey}`}
              data={project.logoSrc}
              type="image/svg+xml"
              w={`${logoW}px`}
              h={`${logoH}px`}
              maxW={`${logoW}px`}
              maxH={`${logoH}px`}
              className="animated-logo"
              aria-label={project.logoAlt ?? `${project.name} logo`}
              sx={{
                '& svg': {
                  width: '100%',
                  height: '100%',
                },
              }}
            />
          ) : (
            <Box
              as="img"
              src={project.logoSrc}
              alt={project.logoAlt ?? `${project.name} logo`}
              w={`${logoW}px`}
              h={`${logoH}px`}
              maxW={`${logoW}px`}
              maxH={`${logoH}px`}
              objectFit="contain"
            />
          )}
        </Box>
      )}

      <Box flex={1} minH={0} display="flex" flexDirection="column">
        <Box mb={3}>
        <Box
          as="h3"
          fontFamily="var(--font-heading)"
          fontSize={{ base: '1.35rem', md: '1.5rem' }}
          fontWeight="600"
          color={headingColor}
          mb={1}
        >
          {project.name}
        </Box>
        {(project.role || project.timeframe) && (
          <Box
            as="p"
            fontFamily="var(--font-body)"
            fontSize="1.05rem"
            color={subtextColor}
          >
            {project.role}
            {project.role && project.timeframe && ' • '}
            {project.timeframe}
          </Box>
        )}
      </Box>

      <Box
        as="p"
        fontFamily="var(--font-body)"
        fontSize="1.05rem"
        color={subtextColor}
        mb={4}
      >
        {project.description}
      </Box>
      </Box>

      <Box>
        {project.tech && project.tech.length > 0 && (
          <Box display="flex" flexWrap="wrap" gap={2} rowGap={2}>
            {project.tech.map((tech) => (
              <Box
                key={tech}
                as="span"
                px={2}
                py={0.5}
                borderRadius="full"
                bg={techBg}
                color={techColor}
                fontFamily="var(--font-body)"
                fontSize="0.85rem"
                transition="all 0.2s"
                cursor="pointer"
                _hover={{
                  bg: 'heart.magenta',
                  color: 'white',
                }}
              >
                {tech}
              </Box>
            ))}
          </Box>
        )}

        <Box mt={3} display="flex" justifyContent="flex-end" alignItems="center" gap={3}>
          <Box
            as="button"
            onClick={onOpen}
            fontFamily="var(--font-heading)"
            fontSize="1rem"
            fontWeight="600"
            color={useColorModeValue('heart.indigo', 'heart.cyan')}
            _hover={{ textDecoration: 'underline' }}
            cursor="pointer"
          >
            View more
          </Box>
          {project.liveUrl && (
            <Box
              as="a"
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              w={8}
              h={8}
              border="2px solid"
              borderColor="rgba(0, 0, 0, 0.2)"
              borderRadius="6px"
              bg={useColorModeValue('heart.uiBg', 'heart.darkPanel')}
              transition="all 0.2s"
              _hover={{
                borderColor: 'heart.magenta',
                bg: 'heart.magenta',
              }}
              _dark={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                _hover: {
                  borderColor: 'heart.magenta',
                  bg: 'heart.magenta',
                },
              }}
              aria-label={`Open ${project.name} website`}
              sx={{
                '& img': {
                  transition: 'filter 0.2s',
                },
                '&:hover img': {
                  filter: 'brightness(0) invert(1)',
                },
              }}
            >
              <Image
                src="/icons/link.svg"
                alt=""
                width={20}
                height={20}
                style={{ objectFit: 'contain' }}
              />
            </Box>
          )}
        </Box>
      </Box>

      <WorkModal isOpen={isOpen} onClose={onClose} project={project} />
    </Box>
  )
}

