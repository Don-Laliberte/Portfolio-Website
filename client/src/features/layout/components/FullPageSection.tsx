'use client'

import { Box, type BoxProps } from '@chakra-ui/react'

interface FullPageSectionProps extends BoxProps {
  id: string
  children: React.ReactNode
}

export function FullPageSection({ id, children, ...props }: FullPageSectionProps) {
  return (
    <Box
      as="section"
      id={id}
      minHeight="100vh"
      minH="100dvh"
      sx={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      px={4}
      py={8}
      {...props}
    >
      <Box maxW="container.md" mx="auto" w="100%">
        {children}
      </Box>
    </Box>
  )
}
