'use client'

import { Box } from '@chakra-ui/react'

export function HomeContent() {
  return (
    <>
      <Box borderRadius="lg" bg="lightblue" p={3} mb={6} textAlign="center">
        Hello, my name is Don Laliberte and I&apos;m a young aspiring developer!
      </Box>
      <Box display={{ md: 'flex' }}>
        <Box flexGrow={1}>
          <Box as="h2" fontSize="2xl" fontWeight="bold" mb={2}>
            Don Laliberte
          </Box>
          <Box as="p">Software Developer</Box>
        </Box>
      </Box>
    </>
  )
}
