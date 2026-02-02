import { extendTheme } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'
import type { StyleFunctionProps } from '@chakra-ui/styled-system'

const styles = {
  global: (props: StyleFunctionProps) => ({
    body: {
      bg: mode('#6fa8dc', '#05273f')(props),
    },
  }),
}

const config = {
  initialColorMode: 'light' as const,
  useSystemColorMode: true,
}

export const theme = extendTheme({ config, styles })
