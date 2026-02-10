'use client'

import { Box } from '@chakra-ui/react'

export function HeroSection() {
  return (
    <Box
      className="heart-card heart-card-banner"
      p={6}
      textAlign="center"
      borderRadius="8px"
      boxShadow="0 4px 20px rgba(74,77,106,0.15)"
      position="relative"
    >
      <Box as="p" className="heart-title-text">
        Hello, my name is Don Laliberte and I&apos;m a young aspiring developer!
      </Box>
    </Box>
  )
}
