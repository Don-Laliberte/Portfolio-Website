'use client'

import { useColorMode, useColorModeValue } from '@chakra-ui/react'
import { SunIcon, MoonIcon } from '@chakra-ui/icons'
import { Box } from '@chakra-ui/react'

export function ThemeToggleButton() {
  const { colorMode, toggleColorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const borderColor = useColorModeValue('heart.uiBorder', 'heart.darkBorder')

  return (
    <Box
      as="button"
      type="button"
      aria-label="Toggle theme"
      onClick={toggleColorMode}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      w={10}
      h={10}
      bg="heart.magenta"
      color="white"
      border="2px solid"
      borderColor={borderColor}
      borderRadius="md"
      boxShadow="0 2px 8px rgba(217,26,122,0.2)"
      _hover={{
        bg: 'heart.magentaDark',
        transform: 'scale(1.05)',
        boxShadow: '0 4px 12px rgba(217,26,122,0.25)',
      }}
      _active={{ transform: 'scale(0.98)' }}
      transition="all 0.2s"
    >
      {isDark ? <SunIcon boxSize={5} /> : <MoonIcon boxSize={5} />}
    </Box>
  )
}
