'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Box, useColorModeValue } from '@chakra-ui/react'
import { Logo } from './Logo'
import { ThemeToggleButton } from './ThemeToggleButton'
import type { NavItem } from '../types'

const NAV_ITEMS: NavItem[] = [
  { href: '/works', label: 'Works' },
  { href: '/socials', label: 'Socials' },
  { href: '/posts', label: 'Posts' },
  { href: '/about', label: 'About' },
]

function NavLink({ href, path, children }: { href: string; path: string; children: React.ReactNode }) {
  const active = path === href
  const inactiveColor = useColorModeValue('gray.800', 'whiteAlpha.900')

  return (
    <Link href={href}>
      <Box
        as="span"
        display="block"
        p={2}
        bg={active ? 'glassTeal' : undefined}
        color={active ? '#202023' : inactiveColor}
        _hover={{ textDecoration: 'none' }}
      >
        {children}
      </Box>
    </Link>
  )
}

export function Navbar() {
  const pathname = usePathname()

  return (
    <Box
      position="fixed"
      as="nav"
      w="100%"
      bg={useColorModeValue('#ffffff40', '#20202380')}
      style={{ backdropFilter: 'blur(10px)' }}
      zIndex={10}
    >
      <Box
        display="flex"
        w="100%"
        maxW="container.md"
        mx="auto"
        p={2}
        flexWrap="nowrap"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box display="flex" alignItems="center" flexShrink={0}>
          <Box as="h1" fontSize="lg" letterSpacing="normal" fontWeight="bold">
            <Logo />
          </Box>
        </Box>

        <Box
          display={{ base: 'none', md: 'flex' }}
          flexDirection="row"
          alignItems="center"
          flexGrow={1}
          justifyContent="flex-end"
          gap={2}
        >
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href} path={pathname}>
              {item.label}
            </NavLink>
          ))}
        </Box>

        <Box flexShrink={0}>
          <ThemeToggleButton />
        </Box>
      </Box>
    </Box>
  )
}
