import { extendTheme } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'
import type { StyleFunctionProps } from '@chakra-ui/styled-system'

// Persona 5 inspired palette - red, black, white, yellow accent
const colors = {
  p5: {
    red: '#d92323',
    redDark: '#732424',
    redLight: '#e63939',
    black: '#0d0d0d',
    white: '#ffffff',
    cream: '#f5f0e8',
    yellow: '#f2b705',
    gray: '#7b7b7b',
  },
}

const styles = {
  global: (props: StyleFunctionProps) => ({
    body: {
      bg: mode('#f5f0e8', '#0d0d0d')(props),
      color: mode('#0d0d0d', '#ffffff')(props),
      fontFamily: 'var(--font-body), system-ui, sans-serif',
    },
    '*::placeholder': {
      color: mode('#7b7b7b', '#7b7b7b')(props),
    },
    'h1, h2, h3, h4, h5, h6': {
      fontFamily: 'var(--font-heading), "Bebas Neue", sans-serif',
      letterSpacing: '0.02em',
    },
  }),
}

const config = {
  initialColorMode: 'dark' as const,
  useSystemColorMode: true,
}

const fonts = {
  heading: 'var(--font-heading), "Bebas Neue", sans-serif',
  body: 'var(--font-body), system-ui, sans-serif',
}

const components = {
  Button: {
    baseStyle: (props: StyleFunctionProps) => ({
      fontFamily: 'var(--font-heading), "Bebas Neue", sans-serif',
      fontWeight: 'normal',
      letterSpacing: 'wider',
      _focus: { boxShadow: 'none' },
      _active: { transform: 'scale(0.98)' },
    }),
    variants: {
      p5: (props: StyleFunctionProps) => ({
        bg: mode('p5.red', 'p5.red')(props),
        color: 'white',
        border: '3px solid',
        borderColor: 'p5.black',
        borderRadius: '0',
        _hover: {
          bg: mode('p5.redDark', 'p5.redLight')(props),
          borderColor: 'p5.black',
        },
      }),
    },
    defaultProps: {
      variant: 'p5',
    },
  },
  Link: {
    baseStyle: (props: StyleFunctionProps) => ({
      color: mode('p5.red', 'p5.yellow')(props),
      fontWeight: 'bold',
      _hover: {
        textDecoration: 'none',
        color: mode('p5.redDark', 'p5.yellow')(props),
      },
    }),
  },
}

export const theme = extendTheme({
  config,
  colors,
  styles,
  fonts,
  components,
})
