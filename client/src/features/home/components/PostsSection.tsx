'use client'

import { Box, useColorModeValue } from '@chakra-ui/react'

export function PostsSection() {
  const headingColor = useColorModeValue('heart.charcoal', 'heart.darkText')
  const subtextColor = useColorModeValue('heart.gray', 'heart.darkTextMuted')

  return (
    <Box textAlign="center" py={8}>
      <Box
        as="h2"
        fontFamily="var(--font-heading)"
        fontSize={{ base: '1.75rem', md: '2.25rem' }}
        fontWeight="600"
        color={headingColor}
        mb={2}
      >
        Posts
      </Box>
      <Box as="p" color={subtextColor} fontSize="1.25rem" fontFamily="var(--font-body)">
        Coming soon.
      </Box>
    </Box>
  )
}
