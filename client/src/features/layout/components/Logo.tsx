'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Box, useColorModeValue } from '@chakra-ui/react'
import styled from '@emotion/styled'

const LogoBox = styled.span`
  font-weight: bold;
  font-size: 18px;
  display: inline-flex;
  align-items: center;
  height: 30px;
  line-height: 20px;
  padding: 10px;
  letter-spacing: 0.05em;

  &:hover img {
    transform: rotate(-10deg) scale(1.05);
  }
  &:hover span {
    color: var(--p5-red) !important;
  }
`

export function Logo() {
  const logo = `/images/contents/logo${useColorModeValue('', '-dark')}.png`
  const textColor = useColorModeValue('p5.black', 'white')

  return (
    <Link href="/">
      <LogoBox>
        <Image priority src={logo} width={35} height={35} alt="Don Laliberte logo" />
        <Box
          as="span"
          color={textColor}
          fontFamily="var(--font-heading), Bebas Neue, sans-serif"
          fontWeight="bold"
          fontSize="xl"
          letterSpacing="wider"
          ml={3}
          transition="color 0.2s"
        >
          Don Laliberte
        </Box>
      </LogoBox>
    </Link>
  )
}
