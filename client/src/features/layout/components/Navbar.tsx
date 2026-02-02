'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Box, useColorModeValue } from '@chakra-ui/react'
import { Logo } from './Logo'
import { ThemeToggleButton } from './ThemeToggleButton'
import type { NavItem } from '../types'

const NAV_ITEMS: NavItem[] = [
  { href: '/resume', label: 'Resume' },
  { href: '/works', label: 'Works' },
  { href: '/socials', label: 'Socials' },
  { href: '/posts', label: 'Posts' },
  { href: '/about', label: 'About' },
]

function NavLink({ href, path, children }: { href: string; path: string; children: React.ReactNode }) {
  const active = path === href
  const textColor = useColorModeValue('heart.charcoal', 'heart.darkText')
  const activeBg = 'heart.magenta'
  const activeColor = 'white'
  const hoverBg = useColorModeValue('heart.pinkLight', 'heart.darkPanel')
  const borderColor = useColorModeValue('heart.uiBorder', 'heart.darkBorder')

  return (
    <Link href={href}>
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
          textDecoration: 'none',
          bg: active ? undefined : hoverBg,
          color: active ? undefined : 'heart.magenta',
          borderColor,
        }}
      >
        {children}
      </Box>
    </Link>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const navBg = useColorModeValue('heart.uiBg', 'heart.darkPanel')
  const borderColor = useColorModeValue('heart.uiBorder', 'heart.darkBorder')
  const navShadow = useColorModeValue('0 2px 16px rgba(74,77,106,0.1)', '0 2px 16px rgba(0,0,0,0.25)')

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
            <Logo />
          </Box>
        </Box>

        <Box
          display={{ base: 'none', md: 'flex' }}
          flexDirection="row"
          alignItems="center"
          flexGrow={1}
          justifyContent="flex-end"
          gap={0}
          mr={2}
        >
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href} path={pathname}>
              {item.label}
            </NavLink>
          ))}
        </Box>

        <Box flexShrink={0} ml={4} display="flex" alignItems="center">
          <ThemeToggleButton />
        </Box>
      </Box>
    </Box>
  )
}
