'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  useColorModeValue,
} from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from '@chakra-ui/icons'
import type { WorkProject } from '@/config/works'

interface WorkModalProps {
  isOpen: boolean
  onClose: () => void
  project: WorkProject
}

export function WorkModal({ isOpen, onClose, project }: WorkModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const cardBg = useColorModeValue('heart.uiBg', 'heart.darkPanel')
  const cardBorder = useColorModeValue('heart.uiBorder', 'heart.darkBorder')
  const headingColor = useColorModeValue('heart.charcoal', 'heart.darkText')
  const subtextColor = useColorModeValue('heart.gray', 'heart.darkTextMuted')
  const techBg = useColorModeValue('heart.pinkLight', 'heart.darkPanel')
  const techColor = useColorModeValue('heart.charcoal', 'heart.darkText')
  const modalBg = useColorModeValue('heart.uiBg', 'heart.darkPanel')
  const dotInactiveColor = useColorModeValue('heart.gray', 'heart.darkTextMuted')

  const images = project.images || []
  const hasImages = images.length > 0
  const hasMultipleImages = images.length > 1

  const goToPrevious = () => {
    setCurrentImageIndex((i) => (i - 1 + images.length) % images.length)
  }

  const goToNext = () => {
    setCurrentImageIndex((i) => (i + 1) % images.length)
  }

  const description = project.extendedDescription || project.description

  const ModalContentStyled = ModalContent as any

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContentStyled
        bg={modalBg}
        border="3px solid"
        borderColor={cardBorder}
        borderRadius="8px"
        className="heart-card"
        maxW="90vw"
        maxH="90vh"
      >
        <Box
          as="header"
          px={6}
          pt={6}
          pb={2}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box
            as="h2"
            fontFamily="var(--font-heading)"
            fontSize="1.75rem"
            fontWeight="600"
            color={headingColor}
          >
            {project.name}
          </Box>
          <Box
            as="button"
            onClick={onClose}
            aria-label="Close modal"
            p={2}
            borderRadius="md"
            _hover={{ bg: useColorModeValue('heart.pinkLight', 'heart.darkPanel') }}
            cursor="pointer"
          >
            <CloseIcon />
          </Box>
        </Box>

        <Box overflowY="auto" px={6} pb={6}>
          {hasImages && (
            <Box mb={6} position="relative" borderRadius="md" overflow="hidden">
              <Box position="relative" width="100%" minH="200px" bg={techBg}>
                <Image
                  src={images[currentImageIndex]}
                  alt={`${project.name} - Image ${currentImageIndex + 1}`}
                  width={800}
                  height={600}
                  style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                  }}
                />
              </Box>

              {hasMultipleImages && (
                <>
                  <Box
                    as="button"
                    aria-label="Previous image"
                    position="absolute"
                    left={2}
                    top="50%"
                    transform="translateY(-50%)"
                    bg={cardBg}
                    border="2px solid"
                    borderColor={cardBorder}
                    borderRadius="md"
                    p={2}
                    onClick={goToPrevious}
                    _hover={{ bg: 'heart.magenta', color: 'white' }}
                    cursor="pointer"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <ChevronLeftIcon />
                  </Box>
                  <Box
                    as="button"
                    aria-label="Next image"
                    position="absolute"
                    right={2}
                    top="50%"
                    transform="translateY(-50%)"
                    bg={cardBg}
                    border="2px solid"
                    borderColor={cardBorder}
                    borderRadius="md"
                    p={2}
                    onClick={goToNext}
                    _hover={{ bg: 'heart.magenta', color: 'white' }}
                    cursor="pointer"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <ChevronRightIcon />
                  </Box>

                  <Box
                    display="flex"
                    gap={2}
                    justifyContent="center"
                    mt={3}
                    position="relative"
                    zIndex={1}
                  >
                    {images.map((_, index) => (
                      <Box
                        key={index}
                        w={2}
                        h={2}
                        borderRadius="full"
                        bg={index === currentImageIndex ? 'heart.magenta' : dotInactiveColor}
                        cursor="pointer"
                        onClick={() => setCurrentImageIndex(index)}
                        transition="all 0.2s"
                        _hover={{ transform: 'scale(1.2)' }}
                      />
                    ))}
                  </Box>
                </>
              )}
            </Box>
          )}

          {(project.role || project.timeframe) && (
            <Box mb={4}>
              <Box
                as="p"
                fontFamily="var(--font-body)"
                fontSize="1.1rem"
                color={subtextColor}
              >
                {project.role}
                {project.role && project.timeframe && ' • '}
                {project.timeframe}
              </Box>
            </Box>
          )}

          <Box
            as="p"
            fontFamily="var(--font-body)"
            fontSize="1.1rem"
            color={subtextColor}
            mb={4}
            lineHeight="1.6"
          >
            {description}
          </Box>

          {project.tech && project.tech.length > 0 && (
            <Box mb={4} display="flex" flexWrap="wrap" gap={2} rowGap={2}>
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
                >
                  {tech}
                </Box>
              ))}
            </Box>
          )}

          {(project.liveUrl || project.repoUrl) && (
            <Box display="flex" gap={4} mt={6} flexWrap="wrap">
              {project.liveUrl && (
                <Box
                  as="a"
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  px={4}
                  py={2}
                  borderRadius="md"
                  border="2px solid"
                  borderColor={cardBorder}
                  bg="heart.magenta"
                  color="white"
                  fontFamily="var(--font-heading)"
                  fontSize="1rem"
                  fontWeight="600"
                  _hover={{
                    bg: 'heart.magentaDark',
                    textDecoration: 'none',
                  }}
                >
                  Open site
                </Box>
              )}
              {project.repoUrl && (
                <Box
                  as="a"
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  px={4}
                  py={2}
                  borderRadius="md"
                  border="2px solid"
                  borderColor={cardBorder}
                  color={useColorModeValue('heart.indigo', 'heart.cyan')}
                  fontFamily="var(--font-heading)"
                  fontSize="1rem"
                  fontWeight="600"
                  _hover={{
                    bg: useColorModeValue('heart.pinkLight', 'heart.darkPanel'),
                    borderColor: 'heart.magenta',
                    textDecoration: 'none',
                  }}
                >
                  View code
                </Box>
              )}
            </Box>
          )}
        </Box>
      </ModalContentStyled>
    </Modal>
  )
}
