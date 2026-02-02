'use client'

import { Box, useColorModeValue } from '@chakra-ui/react'

export function HomeContent() {
  const cardBg = useColorModeValue('white', 'p5.black')
  const cardBorder = useColorModeValue('p5.black', 'p5.red')
  const bannerBg = useColorModeValue('p5.red', 'p5.red')
  const headingColor = useColorModeValue('p5.black', 'p5.yellow')
  const subtextColor = useColorModeValue('p5.gray', 'whiteAlpha.800')

  return (
    <>
      <Box
        className="p5-card"
        bg={bannerBg}
        color="white"
        p={6}
        mb={8}
        textAlign="center"
        border="3px solid"
        borderColor="p5.black"
        borderRadius={0}
        boxShadow="6px 6px 0 var(--p5-black)"
      >
        <Box
          as="p"
          fontFamily="var(--font-heading), Bebas Neue, sans-serif"
          fontSize={{ base: 'xl', md: '2xl' }}
          letterSpacing="wider"
        >
          Hello, my name is Don Laliberte and I&apos;m a young aspiring developer!
        </Box>
      </Box>

      <Box
        className="p5-card"
        bg={cardBg}
        border="3px solid"
        borderColor={cardBorder}
        borderRadius={0}
        p={8}
        boxShadow="6px 6px 0 var(--p5-black)"
        position="relative"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="4px"
          bg="p5.red"
        />
        <Box display={{ md: 'flex' }} alignItems="center" gap={6}>
          <Box flexGrow={1}>
            <Box
              as="h2"
              fontFamily="var(--font-heading), Bebas Neue, sans-serif"
              fontSize={{ base: '3xl', md: '4xl' }}
              fontWeight="normal"
              letterSpacing="wider"
              color={headingColor}
              mb={2}
            >
              Don Laliberte
            </Box>
            <Box as="p" color={subtextColor} fontSize="lg" fontFamily="var(--font-body)">
              Software Developer
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  )
}
