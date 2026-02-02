'use client'

import { useColorMode } from '@chakra-ui/react'
import { SunIcon, MoonIcon } from '@chakra-ui/icons'
import { Box } from '@chakra-ui/react'

export function ThemeToggleButton() {
  const { colorMode, toggleColorMode } = useColorMode()
  const isDark = colorMode === 'dark'

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
      bg="p5.red"
      color="white"
      border="2px solid"
      borderColor="p5.black"
      borderRadius={0}
      _hover={{
        bg: 'p5.redLight',
        transform: 'scale(1.05)',
      }}
      _active={{ transform: 'scale(0.98)' }}
      transition="all 0.2s"
    >
      {isDark ? <SunIcon boxSize={5} /> : <MoonIcon boxSize={5} />}
    </Box>
  )
}
