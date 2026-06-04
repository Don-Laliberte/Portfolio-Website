export interface ResumeLink {
  label: string
  href: string
}

export interface ResumeExperienceItem {
  company: string
  role: string
  timeframe: string
  bullets: string[]
}

export interface ResumeProjectItem {
  name: string
  role: string
  timeframe: string
  stack: string[]
  bullets: string[]
}

export interface ResumeEducationItem {
  school: string
  program: string
  timeframe: string
  details?: string
}

export interface ResumeSkillGroup {
  label: string
  skills: string[]
}

export interface ResumeOnePager {
  version: string
  targetRole: string
  person: {
    name: string
    location: string
    email: string
    links: ResumeLink[]
  }
  summary: string
  education: ResumeEducationItem[]
  skills: ResumeSkillGroup[]
  experience: ResumeExperienceItem[]
  projects: ResumeProjectItem[]
}

/** Public path to the downloadable PDF resume. */
export const RESUME_PDF_PATH = '/documents/Don-Laliberte-Resume.pdf'

export const RESUME_PDF_FILENAME = 'Don-Laliberte-Resume.pdf'

export const RESUME_ONE_PAGER: ResumeOnePager = {
  version: 'new-grad-v1',
  targetRole: 'SWE Intern / New Grad',
  person: {
    name: 'Don H. Laliberte',
    location: 'Calgary, AB',
    email: 'donhlaliberte@outlook.com',
    links: [
      { label: 'Portfolio', href: 'https://donhlaliberte.dev' },
      { label: 'GitHub', href: 'https://github.com/Don-Laliberte' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/don-h-laliberte/' },
    ],
  },
  summary:
    'Computer Science student shipping production web platforms for student communities. Focused on TypeScript, Next.js, and Cloudflare with strong ownership across features, performance, and deployment workflows.',
  education: [
    {
      school: 'Southern Alberta Institute of Technology',
      program: 'Information Technology: Software Development Diploma',
      timeframe: 'September 2020 - May 2022',
      details: 'GPA: 3.84 / 4.0',
    },
    {
      school: 'University of Calgary',
      program: 'BSc Computer Science',
      timeframe: 'In Progress',
      details: 'CSUS President 2027',
    },
  ],
  skills: [
    {
      label: 'Languages',
      skills: ['TypeScript', 'JavaScript', 'SQL', 'Python', 'Java'],
    },
    {
      label: 'Familiar',
      skills: ['C', 'C++', 'C#'],
    },
    {
      label: 'Frameworks',
      skills: ['Next.js', 'React', 'Node.js'],
    },
    {
      label: 'Cloud & Data',
      skills: ['Cloudflare Workers', 'R2', 'D1', 'Drizzle ORM', 'MongoDB', 'Convex'],
    },
    {
      label: 'Tooling',
      skills: ['OpenNext', 'Wrangler', 'Git/GitHub', 'Sentry'],
    },
  ],
  experience: [
    {
      company: 'Tech Start',
      role: 'Software Developer',
      timeframe: 'Recent',
      bullets: [
        'Delivered product features in collaboration with founders and teammates using modern web tooling.',
        'Improved release confidence by helping test, validate, and harden changes before rollout.',
        'Contributed to maintainable code patterns and developer workflows while working within private codebases.',
      ],
    },
    {
      company: 'New Idea Machine',
      role: 'Software Developer',
      timeframe: 'Recent',
      bullets: [
        'Built and refined internal/external-facing functionality with attention to reliability and UX.',
        'Supported iterative delivery cycles by translating requirements into shippable milestones.',
        'Worked cross-functionally and communicated technical tradeoffs in a fast-moving environment.',
      ],
    },
  ],
  projects: [
    {
      name: 'CalgaryHacks 2026',
      role: 'Full Stack Developer',
      timeframe: '2025-2026',
      stack: ['Next.js', 'TypeScript', 'Cloudflare Workers', 'OpenNext', 'R2'],
      bullets: [
        'Built and shipped the public event website for registrations, schedule, and sponsor content.',
        'Deployed on Cloudflare Workers with OpenNext and R2-backed caching for better repeat-load performance.',
      ],
    },
    {
      name: 'CSUS Club Website',
      role: 'Full Stack Developer',
      timeframe: '2025-2026',
      stack: ['Next.js', 'TypeScript', 'Cloudflare Workers', 'D1', 'Drizzle ORM', 'Better Auth'],
      bullets: [
        'Developed and maintained a student platform covering events, resources, and community workflows.',
        'Implemented production-ready features across auth, data-backed pages, and admin tooling.',
      ],
    },
  ],
}
