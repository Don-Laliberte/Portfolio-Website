export type WorkProject = {
  id: string
  name: string
  role?: string
  timeframe?: string
  description: string
  tech?: string[]
  liveUrl?: string
  repoUrl?: string
  /** Optional Devpost project page (hackathon write-ups). */
  devpostUrl?: string
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
    id: 'build-and-connect',
    name: 'Build & Connect',
    role: 'Full Stack Developer',
    timeframe: '2026',
    description:
      'CodeTheChange 2026 team project matching early-career Calgary developers with community groups, non-profits, and small businesses that need technical help.',
    extendedDescription:
      'Built with my team for CodeTheChange 2026. Build & Connect helps early-career developers find meaningful local projects while letting community groups and small businesses post requests in plain language. We shipped a Three.js landing experience, Mapbox-powered nearby request map, Convex backend with Better Auth, interest-based matching, and real-time opportunity chat. We didn\'t place, but it was a strong end-to-end product for a hackathon weekend.',
    tech: [
      'Next.js',
      'TypeScript',
      'Convex',
      'Mapbox',
      'Three.js',
    ],
    modalTech: [
      'Next.js',
      'React',
      'TypeScript',
      'Convex',
      'Better Auth',
      'Mapbox',
      'Three.js',
      'Cloudflare Workers',
      'Fireworks AI',
    ],
    liveUrl: 'https://buildandconnect.work',
    repoUrl: 'https://github.com/ms-dwellers/buildandconnect',
    devpostUrl: 'https://devpost.com/software/build-connect',
    logoSrc: '/images/works/BuildAndConnect-Thumbnail.jpg',
    logoAlt: 'Build & Connect thumbnail',
    logoWidth: 200,
    logoHeight: 112,
    images: ['/images/works/BuildAndConnect-Thumbnail.jpg'],
  },
  {
    id: 'patchwork',
    name: 'Patchwork',
    role: 'Full Stack Developer',
    timeframe: '2026',
    description:
      'Local-first skincare ingredient tracker that compares breakout and tolerated products to surface likely culprit ingredients.',
    extendedDescription:
      'Patchwork helps you figure out which ingredients might be causing breakouts. Log products by paste, photo OCR, barcode, or URL, tag them as breakout or tolerated, and review an elimination list of shared suspects. Everything stays on-device with IndexedDB — no account required — with CSV export and an optional Google Drive upload. Built as an installable PWA on React, Vite, and TypeScript, deployed to Cloudflare Pages.',
    tech: [
      'React',
      'Vite',
      'TypeScript',
      'Dexie',
      'Cloudflare Pages',
    ],
    modalTech: [
      'React',
      'Vite',
      'TypeScript',
      'Tailwind CSS',
      'Dexie',
      'PWA',
      'Cloudflare Pages',
      'Open Beauty Facts',
    ],
    liveUrl: 'https://patchworkskincare.ca',
    repoUrl: 'https://github.com/Don-Laliberte/Patchwork',
    logoSrc: '/images/works/patchwork-logo.png',
    logoAlt: 'Patchwork logo',
    logoWidth: 200,
    logoHeight: 53,
    images: ['/images/works/patchwork-logo.png'],
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
