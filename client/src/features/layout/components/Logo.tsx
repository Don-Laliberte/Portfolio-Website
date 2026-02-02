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

  &:hover img {
    transform: rotate(20deg);
  }
`

export function Logo() {
  const logo = `/images/contents/logo${useColorModeValue('', '-dark')}.png`

  return (
    <Link href="/">
      <LogoBox>
        <Image priority src={logo} width={35} height={35} alt="Don Laliberte logo" />
        <Box
          as="span"
          color={useColorModeValue('gray.800', 'whiteAlpha.900')}
          fontFamily="M PLUS Rounded 1, sans-serif"
          fontWeight="bold"
          ml={3}
        >
          Don Laliberte
        </Box>
      </LogoBox>
    </Link>
  )
}
