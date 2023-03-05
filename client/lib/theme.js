import { color, extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";



const styles = {
  global: props => ({
    body: {
      bg: mode('#6fa8dc', '#05273f')(props)
    }
  })
}

const config = {
  initialColorMode: 'dark', 
  useSystemColorMode: false,
}

const theme = extendTheme({ config, styles })

export default theme