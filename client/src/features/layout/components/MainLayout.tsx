'use client'

import { useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import { Navbar } from './Navbar'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  useEffect(() => {
    document.body.classList.add('single-scroll-layout')
    return () => document.body.classList.remove('single-scroll-layout')
  }, [])

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : ''
    if (!hash) return
    const id = hash.slice(1)
    const scrollToSection = () => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' })
    }
    const t = requestAnimationFrame(() => requestAnimationFrame(scrollToSection))
    return () => cancelAnimationFrame(t)
  }, [])

  return (
    <Box as="main">
      <Navbar />
      <Box
        as="div"
        className="scroll-container"
        pt={14}
      >
        {children}
      </Box>
    </Box>
  )
}
