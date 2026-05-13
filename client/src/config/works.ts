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
  /**
   * Optional dark-mode logo variant. When the active theme is `dark`, this
   * takes precedence over `logoSrc`. Falls back to `logoSrc` when unset, so
   * it's safe to only provide this for projects that need it.
   */
  logoSrcDark?: string
  logoAlt?: string
  /** Logo display size in pixels (default 64×64 when omitted) */
  logoWidth?: number
  logoHeight?: number
  // Extended content for modal
  extendedDescription?: string
  modalTech?: string[]
  images?: string[]
}

export const WORK_PROJECTS: WorkProject[] = [
  {
    id: 'calgaryhacks',
    name: 'CalgaryHacks 2026',
    role: 'Full Stack Developer',
    timeframe: '2025-2026',
    description:
      'Hackathon website for CalgaryHacks 2026 with registration, schedule, and sponsor information in a playful wireframe, dark cyberpunk UI.',
    extendedDescription:
      'Built the CalgaryHacks 2026 platform with Next.js, React, and TypeScript, then deployed it to Cloudflare Workers via OpenNext. Implemented R2-backed incremental caching and image optimization workflows to improve load performance across content-heavy pages, while shipping on an experimental Next.js 16 runtime with production-focused testing and rollout workflows.',
    tech: ['Next.js', 
      'TypeScript', 
      'Cloudflare Workers', 
      'OpenNext', 
      'R2'
    ],
    modalTech: [
      'Next.js',
      'React',
      'TypeScript',
      'Cloudflare Workers',
      'OpenNext',
      'R2',
      'Wrangler',
      'Sharp',
    ],
    liveUrl: 'https://calgaryhacks.ca/2026',
    logoSrc: '/images/works/calgaryhacks-logo.svg',
    logoSrcDark: '/images/works/calgaryhacks-logo-dark.svg',
    logoAlt: 'CalgaryHacks logo',
    logoWidth: 160,
    logoHeight: 48,
    images: ['/images/works/CalgaryHacks2026 Image.png'],
  },
  {
    id: 'csus-club',
    name: 'CSUS Club Website',
    role: 'Full Stack Developer',
    timeframe: '2025-2026',
    description:
      'Website for the Computer Science Undergraduate Society (CSUS) featuring events, resources, and links for students.',
    tech: [
      'Next.js', 
      'TypeScript', 
      'Cloudflare Workers', 
      'D1', 
      'Drizzle ORM', 
      'Better Auth'
    ],
    modalTech: [
      'Next.js',
      'React',
      'TypeScript',
      'Cloudflare Workers',
      'OpenNext',
      'D1 (SQLite)',
      'Drizzle ORM',
      'R2',
      'Better Auth',
      'Sentry',
    ],
    liveUrl: 'https://csus.club',
    logoSrc: '/images/works/csus-logo.svg',
    logoSrcDark: '/images/works/csus-logo-dark.svg',
    logoAlt: 'CSUS Club logo',
    logoWidth: 140,
    logoHeight: 36,
    images: ['/images/works/CSUS Website Image.png'],
  },
]
