export type WorkProject = {
  id: string
  name: string
  role?: string
  timeframe?: string
  description: string
  tech?: string[]
  liveUrl?: string
  repoUrl?: string
  highlight?: boolean
  // Optional branding / imagery for future use
  logoSrc?: string
  logoAlt?: string
  // Extended content for modal
  extendedDescription?: string
  images?: string[]
}

export const WORK_PROJECTS: WorkProject[] = [
  {
    id: 'calgaryhacks',
    name: 'CalgaryHacks',
    role: 'Full Stack Developer',
    timeframe: '2025-2026',
    description:
      'Hackathon website for CalgaryHacks 2026 with registration, schedule, and sponsor information in a playful pixel UI.',
    tech: ['Next.js', 'TypeScript', 'Cloudflare'],
    liveUrl: 'https://calgaryhacks.ca',
    logoSrc: '/images/works/calgaryhacks-logo.svg',
    logoAlt: 'CalgaryHacks logo',
  },
  {
    id: 'csus-club',
    name: 'CSUS Club Website',
    role: 'Full Stack Developer',
    timeframe: '2025-2026',
    description:
      'Website for the Computer Science Undergraduate Society (CSUS) featuring events, resources, and links for students.',
    tech: ['Next.js', 'TypeScript', 'Cloudflare'],
    liveUrl: 'https://csus.club',
    logoSrc: '/images/works/csus-logo.svg',
    logoAlt: 'CSUS Club logo',
  },
]
