'use client'

import Link from 'next/link'
import { Box, useColorModeValue } from '@chakra-ui/react'

const RESUME_PATH = '/documents/Don-Laliberte-Resume.pdf'

export default function ResumePage() {
  const cardBg = useColorModeValue('heart.uiBg', 'heart.darkPanel')
  const cardBorder = useColorModeValue('heart.uiBorder', 'heart.darkBorder')
  const headingColor = useColorModeValue('heart.charcoal', 'heart.darkText')
  const subtextColor = useColorModeValue('heart.gray', 'heart.darkTextMuted')
  const buttonBorder = useColorModeValue('heart.uiBorder', 'heart.darkBorder')

  return (
    <>
      <Box
        className="heart-card"
        bg={cardBg}
        border="3px solid"
        borderColor={cardBorder}
        borderRadius="8px"
        p={6}
        mb={6}
        position="relative"
      >
        <Box
          as="h1"
          fontFamily="var(--font-heading)"
          fontSize={{ base: '1.75rem', md: '2.25rem' }}
          fontWeight="600"
          color={headingColor}
          mb={1}
        >
          Resume
        </Box>
        <Box as="p" color={subtextColor} fontSize="1.25rem" fontFamily="var(--font-body)" mb={4}>
          Don H. Laliberte — Full Stack
        </Box>
        <Box
          as="a"
          href={RESUME_PATH}
          download="Don-Laliberte-Resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          display="inline-block"
          fontFamily="var(--font-heading)"
          fontSize="1.1rem"
          fontWeight="600"
          color="white"
          bg="heart.magenta"
          border="2px solid"
          borderColor={buttonBorder}
          borderRadius="md"
          px={5}
          py={2}
          mb={4}
          _hover={{ bg: 'heart.magentaDark', textDecoration: 'none' }}
        >
          Download PDF
        </Box>
      </Box>

      <Box
        className="heart-card"
        bg={cardBg}
        border="3px solid"
        borderColor={cardBorder}
        borderRadius="8px"
        overflow="hidden"
        position="relative"
        minH="80vh"
      >
        <Box
          as="iframe"
          src={`${RESUME_PATH}#view=FitH`}
          title="Don Laliberte Resume"
          width="100%"
          height="78vh"
          minH="600px"
          border="none"
        />
      </Box>
    </>
  )
}
