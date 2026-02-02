import { extendTheme } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'
import type { StyleFunctionProps } from '@chakra-ui/styled-system'

// 1BitHeart game UI - pixel fonts; dark mode = trousers/bitphone purple-blue
const colors = {
  heart: {
    pink: '#f0a8c8',
    pinkLight: '#f8d4e4',
    magenta: '#d91a7a',
    magentaDark: '#b81466',
    purple: '#7b6b9a',
    indigo: '#5c4d7a',
    cyan: '#a8d0e6',
    cyanMuted: '#c8e0f0',
    white: '#ffffff',
    cream: '#fef8fb',
    charcoal: '#4a4a5a',
    gray: '#7a7a8a',
    border: '#e8dce4',
    uiBorder: '#4a4d6a',
    uiBg: '#f8f6f4',
    // Dark mode - deep purple-blue from trousers & bitphone
    darkBg: '#2a2540',
    darkPanel: '#352a4a',
    darkBorder: '#4a4060',
    darkText: '#f0e8f8',
    darkTextMuted: '#b8b0c8',
  },
}

const styles = {
  global: (props: StyleFunctionProps) => ({
    body: {
      bg: mode('#ffffff', 'heart.darkBg')(props),
      color: mode('#4a4a5a', 'heart.darkText')(props),
      fontFamily: 'var(--font-body), monospace, sans-serif',
      fontSize: '1.125rem',
      lineHeight: 1.5,
    },
    '*::placeholder': {
      color: mode('#7a7a8a', 'heart.darkTextMuted')(props),
    },
    'h1, h2, h3, h4, h5, h6': {
      fontFamily: 'var(--font-heading), "Pixelify Sans", sans-serif',
      letterSpacing: '0.02em',
      color: mode('heart.charcoal', 'heart.darkText')(props),
      textShadow: mode('0 0 1px white, 0 1px 2px rgba(0,0,0,0.06)', '0 0 1px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.3)')(props),
    },
  }),
}

const config = {
  initialColorMode: 'light' as const,
  useSystemColorMode: true,
}

const fonts = {
  heading: 'var(--font-heading), "Pixelify Sans", sans-serif',
  body: 'var(--font-body), VT323, monospace',
}

const components = {
  Button: {
    baseStyle: (props: StyleFunctionProps) => ({
      fontFamily: 'var(--font-heading), "Pixelify Sans", sans-serif',
      fontWeight: '600',
      letterSpacing: '0.02em',
      _focus: { boxShadow: 'none' },
      _active: { transform: 'scale(0.98)' },
    }),
    variants: {
      heart: (props: StyleFunctionProps) => ({
        bg: 'heart.magenta',
        color: 'white',
        border: '2px solid',
        borderColor: 'heart.uiBorder',
        borderRadius: 'md',
        boxShadow: '0 2px 8px rgba(217,26,122,0.2)',
        _hover: {
          bg: 'heart.magentaDark',
          borderColor: 'heart.uiBorder',
          boxShadow: '0 4px 12px rgba(217,26,122,0.25)',
        },
      }),
    },
    defaultProps: {
      variant: 'heart',
    },
  },
  Link: {
    baseStyle: (props: StyleFunctionProps) => ({
      color: mode('heart.magenta', 'heart.purple')(props),
      fontWeight: 'bold',
      _hover: {
        textDecoration: 'none',
        color: mode('heart.magentaDark', 'heart.indigo')(props),
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
