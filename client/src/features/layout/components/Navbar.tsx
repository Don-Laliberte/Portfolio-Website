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
  const textColor = useColorModeValue('p5.black', 'white')
  const activeBg = useColorModeValue('p5.red', 'p5.red')
  const activeColor = 'white'
  const hoverBg = useColorModeValue('p5.red', 'p5.redLight')

  return (
    <Link href={href}>
      <Box
        as="span"
        display="block"
        px={4}
        py={2}
        fontFamily="var(--font-heading), Bebas Neue, sans-serif"
        fontSize="lg"
        letterSpacing="wider"
        bg={active ? activeBg : 'transparent'}
        color={active ? activeColor : textColor}
        border={active ? '2px solid' : '2px solid transparent'}
        borderColor={active ? 'p5.black' : 'transparent'}
        _hover={{
          textDecoration: 'none',
          bg: active ? undefined : hoverBg,
          color: 'white',
          borderColor: 'p5.black',
        }}
      >
        {children}
      </Box>
    </Link>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const navBg = useColorModeValue('white', 'p5.black')
  const borderColor = useColorModeValue('p5.black', 'p5.red')

  return (
    <Box
      position="fixed"
      as="nav"
      w="100%"
      bg={navBg}
      borderBottom="4px solid"
      borderColor={borderColor}
      zIndex={10}
      boxShadow="0 4px 0 rgba(0,0,0,0.2)"
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
          <Box as="h1" fontSize="xl" fontFamily="var(--font-heading), Bebas Neue, sans-serif" letterSpacing="wider">
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
