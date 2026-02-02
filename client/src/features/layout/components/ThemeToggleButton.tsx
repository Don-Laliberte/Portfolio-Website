'use client'

import { IconButton, useColorMode, useColorModeValue } from '@chakra-ui/react'
import { SunIcon, MoonIcon } from '@chakra-ui/icons'

export function ThemeToggleButton() {
  const { toggleColorMode } = useColorMode()

  return (
    // @ts-expect-error Chakra IconButton polymorphic type too complex
    <IconButton
      aria-label="Toggle theme"
      colorScheme={useColorModeValue('blackAlpha', 'orange')}
      icon={useColorModeValue(<MoonIcon />, <SunIcon />)}
      onClick={toggleColorMode}
    />
  )
}
