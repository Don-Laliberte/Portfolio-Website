'use client'

import { useCallback, useEffect, useState } from 'react'
import { Box, useColorModeValue } from '@chakra-ui/react'
import { Logo } from './Logo'
import { ThemeToggleButton } from './ThemeToggleButton'
import type { NavItem } from '../types'

const SECTION_IDS = ['hero', 'about', 'resume', 'works', 'socials', 'posts'] as const

const NAV_ITEMS: NavItem[] = [
  { href: '#hero', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#resume', label: 'Resume' },
  { href: '#works', label: 'Works' },
  { href: '#socials', label: 'Socials' },
  { href: '#posts', label: 'Posts' },
]

function scrollToSection(href: string) {
  const id = href.startsWith('#') ? href.slice(1) : href
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.pushState(undefined, '', href)
  }
}

function NavLink({
  href,
  activeSectionId,
  children,
}: {
  href: string
  activeSectionId: string
  children: React.ReactNode
}) {
  const sectionId = href.startsWith('#') ? href.slice(1) : href
  const active = activeSectionId === sectionId
  const textColor = useColorModeValue('heart.charcoal', 'heart.darkText')
  const activeBg = 'heart.magenta'
  const activeColor = 'white'
  const hoverBg = useColorModeValue('heart.pinkLight', 'heart.darkPanel')
  const borderColor = useColorModeValue('heart.uiBorder', 'heart.darkBorder')

  return (
    <Box
      as="a"
      href={href}
      onClick={(e: React.MouseEvent) => {
        e.preventDefault()
        scrollToSection(href)
      }}
      _hover={{ textDecoration: 'none' }}
    >
      <Box
        as="span"
        display="block"
        px={4}
        py={2}
        fontFamily="var(--font-heading)"
        fontSize={{ base: '1.1rem', md: '1.25rem' }}
        letterSpacing="0.02em"
        bg={active ? activeBg : 'transparent'}
        color={active ? activeColor : textColor}
        borderRadius="md"
        border={active ? '2px solid' : '2px solid transparent'}
        borderColor={active ? borderColor : 'transparent'}
        _hover={{
          bg: active ? undefined : hoverBg,
          color: active ? undefined : 'heart.magenta',
          borderColor,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export function Navbar() {
  const [activeSectionId, setActiveSectionId] = useState('hero')
  const navBg = useColorModeValue('heart.uiBg', 'heart.darkPanel')
  const borderColor = useColorModeValue('heart.uiBorder', 'heart.darkBorder')
  const navShadow = useColorModeValue('0 2px 16px rgba(74,77,106,0.1)', '0 2px 16px rgba(0,0,0,0.25)')

  const updateActiveSection = useCallback(() => {
    const container = document.querySelector('.scroll-container')
    if (!container) return
    const scrollTop = container.scrollTop
    let active: (typeof SECTION_IDS)[number] = SECTION_IDS[0]
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id)
      if (el && el.offsetTop <= scrollTop + 120) {
        active = id
      }
    }
    setActiveSectionId(active)
  }, [])

  useEffect(() => {
    const container = document.querySelector('.scroll-container')
    if (!container) return
    updateActiveSection()
    container.addEventListener('scroll', updateActiveSection)
    return () => container.removeEventListener('scroll', updateActiveSection)
  }, [updateActiveSection])

  return (
    <Box
      position="fixed"
      as="nav"
      w="100%"
      bg={navBg}
      borderBottom="3px solid"
      borderColor={borderColor}
      zIndex={10}
      boxShadow={navShadow}
    >
      <Box
        display="flex"
        w="100%"
        maxW="container.xl"
        mx="auto"
        px={4}
        py={2}
        pr={4}
        flexWrap="nowrap"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box display="flex" alignItems="center" flexShrink={0}>
          <Box as="h1" fontSize={{ base: '1.25rem', md: '1.5rem' }} fontFamily="var(--font-heading)" letterSpacing="0.02em">
            <Logo onHomeClick={() => scrollToSection('#hero')} />
          </Box>
        </Box>

        <Box display="flex" alignItems="center" flexShrink={0} gap={0} ml={4}>
          <Box
            display={{ base: 'none', md: 'flex' }}
            flexDirection="row"
            alignItems="center"
            gap={0}
            mr={2}
          >
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.href} href={item.href} activeSectionId={activeSectionId}>
                {item.label}
              </NavLink>
            ))}
          </Box>
          <Box display="flex" alignItems="center">
            <ThemeToggleButton />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
