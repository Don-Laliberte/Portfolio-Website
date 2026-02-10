'use client'

import Image from 'next/image'
import { Box, useColorModeValue } from '@chakra-ui/react'

const socialLinks = [
  {
    name: 'Instagram',
    handle: '@don.withyou',
    href: 'https://www.instagram.com/don.withyou/',
    iconSrc: '/icons/instagram.svg',
    iconSize: 32,
    description: 'Photos & personal updates',
    cta: 'Open on Instagram',
    hoverShadow: '0 6px 24px rgba(217, 26, 122, 0.25)',
    accentBorder: 'heart.magenta',
  },
  {
    name: 'LinkedIn',
    handle: 'Don H. Laliberte',
    href: 'https://www.linkedin.com/in/don-h-laliberte/',
    iconSrc: '/icons/linkedin.svg',
    iconSize: 32,
    description: 'Professional profile',
    cta: 'Open on LinkedIn',
    hoverShadow: '0 6px 24px rgba(0, 119, 183, 0.25)',
    accentBorder: 'blue.500',
  },
  {
    name: 'GitHub',
    handle: 'Don-Laliberte',
    href: 'https://github.com/Don-Laliberte',
    iconSrc: '/icons/github.svg',
    iconSize: 40,
    description: 'Projects & code',
    cta: 'Open on GitHub',
    hoverShadow: '0 6px 24px rgba(92, 77, 122, 0.3)',
    accentBorder: 'heart.indigo',
  },
]

export function SocialsSection() {
  const headingColor = useColorModeValue('heart.charcoal', 'heart.darkText')
  const subtextColor = useColorModeValue('heart.gray', 'heart.darkTextMuted')
  const cardBg = useColorModeValue('heart.uiBg', 'heart.darkPanel')
  const cardBorder = useColorModeValue('heart.uiBorder', 'heart.darkBorder')
  const iconBg = useColorModeValue('heart.pinkLight', 'heart.darkPanel')
  const iconColor = useColorModeValue('heart.charcoal', 'heart.darkText')

  return (
    <Box>
      <Box textAlign="center" mb={6}>
        <Box
          as="h2"
          fontFamily="var(--font-heading)"
          fontSize={{ base: '1.75rem', md: '2.25rem' }}
          fontWeight="600"
          color={headingColor}
          mb={2}
        >
          Socials
        </Box>
        <Box as="p" color={subtextColor} fontSize="1.25rem" fontFamily="var(--font-body)">
          Find me on the web
        </Box>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
        gap={6}
      >
        {socialLinks.map((link) => (
          <Box
            key={link.name}
            as="a"
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open Don Laliberte's ${link.name} profile`}
            className="heart-card"
            bg={cardBg}
            border="3px solid"
            borderColor={cardBorder}
            borderRadius="8px"
            p={6}
            boxShadow="0 4px 16px rgba(74,77,106,0.12)"
            position="relative"
            transition="all 0.2s"
            display="block"
            _hover={{
              textDecoration: 'none',
              borderColor: link.accentBorder,
              boxShadow: link.hoverShadow,
              transform: 'translateY(-2px)',
            }}
            _dark={{
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}
          >
            <Box display="flex" alignItems="center" mb={3}>
              <Box
                flexShrink={0}
                boxSize="48px"
                borderRadius="full"
                bg={iconBg}
                display="flex"
                alignItems="center"
                justifyContent="center"
                color={iconColor}
                overflow="hidden"
              >
                <Image
                  src={link.iconSrc}
                  alt=""
                  width={link.iconSize}
                  height={link.iconSize}
                  style={{ objectFit: 'contain' }}
                />
              </Box>
              <Box ml={4} minW={0}>
                <Box
                  as="span"
                  fontFamily="var(--font-heading)"
                  fontSize={{ base: '1.25rem', md: '1.35rem' }}
                  fontWeight="600"
                  color={headingColor}
                  display="block"
                >
                  {link.name}
                </Box>
                <Box
                  as="span"
                  fontFamily="var(--font-body)"
                  fontSize="1.1rem"
                  color={subtextColor}
                  display="block"
                  noOfLines={1}
                >
                  {link.handle}
                </Box>
              </Box>
            </Box>
            <Box
              as="p"
              fontFamily="var(--font-body)"
              fontSize="1.1rem"
              color={subtextColor}
              mt={2}
              mb={4}
            >
              {link.description}
            </Box>
            <Box
              as="span"
              fontFamily="var(--font-heading)"
              fontSize="1rem"
              fontWeight="600"
              color={link.accentBorder}
            >
              {link.cta}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
