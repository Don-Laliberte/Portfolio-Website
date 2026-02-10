'use client'

import Image from 'next/image'
import { Box, useColorModeValue } from '@chakra-ui/react'
import styled from '@emotion/styled'

const LogoBox = styled.span`
  font-weight: 600;
  font-size: 1.25rem;
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  line-height: 1.4;
  padding: 8px 10px;
  letter-spacing: 0.02em;
  font-family: var(--font-heading);

  &:hover img {
    transform: rotate(-10deg) scale(1.05);
  }
  &:hover span {
    color: var(--heart-magenta) !important;
  }
`

interface LogoProps {
  onHomeClick: () => void
}

export function Logo({ onHomeClick }: LogoProps) {
  const logo = `/images/contents/logo${useColorModeValue('', '-dark')}.png`
  const textColor = useColorModeValue('heart.charcoal', 'heart.darkText')

  return (
    <Box
      as="a"
      href="#hero"
      onClick={(e: React.MouseEvent) => {
        e.preventDefault()
        onHomeClick()
      }}
      _hover={{ textDecoration: 'none' }}
      display="inline-block"
    >
      <LogoBox>
        <Image priority src={logo} width={35} height={35} alt="Don Laliberte logo" />
        <Box
          as="span"
          color={textColor}
          fontFamily="var(--font-heading)"
          fontWeight="600"
          fontSize={{ base: '1.25rem', md: '1.5rem' }}
          letterSpacing="0.02em"
          ml={3}
          transition="color 0.2s"
        >
          Don Laliberte
        </Box>
      </LogoBox>
    </Box>
  )
}
