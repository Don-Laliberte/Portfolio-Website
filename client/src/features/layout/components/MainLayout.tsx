'use client'

import { Box } from '@chakra-ui/react'
import { Navbar } from './Navbar'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <Box as="main" pb={8}>
      <Navbar />
      <Box maxW="container.md" mx="auto" pt={14} px={4}>
        {children}
      </Box>
    </Box>
  )
}
