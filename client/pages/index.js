import { Container, Box, Heading, Text } from '@chakra-ui/react'
// import Logo from '../components/logo'
const Page = () => {
  return (
    <Container>
      <Box borderRadius="lg" bg="lightblue" p={3} mb={6} align="center">
        Hello, my name is Don Laliberte and I'm a young aspiring developer!
      </Box>
      <Box display={{ md: 'flex' }}>
        <Box flexGrow={1}>
          <Heading as="h2" variant="page-title">
            Don Laliberte
          </Heading>
          <Text>Software Developer</Text>
        </Box>
      </Box>
    </Container>
  )
}

export default Page
