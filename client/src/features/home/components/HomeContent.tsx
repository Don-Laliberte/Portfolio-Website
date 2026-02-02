'use client'

import { Box, useColorModeValue } from '@chakra-ui/react'

export function HomeContent() {
  const cardBg = useColorModeValue('heart.uiBg', 'heart.darkPanel')
  const cardBorder = useColorModeValue('heart.uiBorder', 'heart.darkBorder')
  const headingColor = useColorModeValue('heart.charcoal', 'heart.darkText')
  const subtextColor = useColorModeValue('heart.gray', 'heart.darkTextMuted')

  return (
    <>
      <Box
        className="heart-card heart-card-banner"
        p={6}
        mb={8}
        textAlign="center"
        borderRadius="8px"
        boxShadow="0 4px 20px rgba(74,77,106,0.15)"
        position="relative"
      >
        <Box as="p" className="heart-title-text">
          Hello, my name is Don Laliberte and I&apos;m a young aspiring developer!
        </Box>
      </Box>

      <Box
        className="heart-card"
        bg={cardBg}
        border="3px solid"
        borderColor={cardBorder}
        borderRadius="8px"
        p={8}
        boxShadow="0 4px 16px rgba(74,77,106,0.12)"
        position="relative"
      >
        <Box display={{ md: 'flex' }} alignItems="center" gap={6}>
          <Box flexGrow={1}>
            <Box
              as="h2"
              fontFamily="var(--font-heading)"
              fontSize={{ base: '2rem', md: '2.5rem' }}
              fontWeight="600"
              letterSpacing="0.02em"
              color={headingColor}
              mb={2}
              textShadow="0 0 1px white, 0 1px 2px rgba(0,0,0,0.06)"
            >
              Don Laliberte
            </Box>
            <Box as="p" color={subtextColor} fontSize="1.5rem" fontFamily="var(--font-body)">
              Software Developer
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  )
}
