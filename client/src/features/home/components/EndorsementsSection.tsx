'use client'

import { m } from 'framer-motion'
import { useMemo, useState } from 'react'
import { CyberPanel } from '@/components/shared/CyberPanel'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { ENDORSEMENTS, type Endorsement } from '@/config/endorsements'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.25 } },
}

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
}

/**
 * Resolve a hostname for display + favicon lookup. Falls back to the raw URL
 * if parsing fails so a typo in the config doesn't crash the page.
 */
function safeHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function faviconFor(endorsement: Endorsement): string | null {
  if (endorsement.iconSrc) return endorsement.iconSrc
  try {
    const host = new URL(endorsement.url).hostname
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`
  } catch {
    return null
  }
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

function EndorsementCard({ endorsement }: { endorsement: Endorsement }) {
  const [failed, setFailed] = useState(false)
  const hostname = useMemo(() => safeHostname(endorsement.url), [endorsement.url])
  const favicon = useMemo(() => faviconFor(endorsement), [endorsement])
  const initials = useMemo(() => initialsFor(endorsement.name), [endorsement.name])
  const showImage = favicon !== null && !failed

  return (
    <m.a
      variants={item}
      href={endorsement.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit ${endorsement.name} at ${hostname}`}
      className="group block no-underline"
    >
      <CyberPanel hover className="flex h-full items-center gap-4 p-4 md:p-5">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-sm bg-panel-soft border-token-muted">
          {showImage ? (
            // Plain <img> avoids needing remotePatterns in next.config.ts.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={favicon!}
              alt=""
              width={32}
              height={32}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setFailed(true)}
              className="h-8 w-8 object-contain"
            />
          ) : (
            <span
              aria-hidden
              className="font-tech text-sm font-bold tracking-wide text-accent"
            >
              {initials}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl font-bold text-foreground">
            {endorsement.name}
          </p>
          <p className="truncate font-tech text-xs uppercase tracking-[0.2em] text-muted">
            {hostname}
          </p>
        </div>

        <span
          aria-hidden
          className="endorsement-arrow ml-2 inline-block flex-shrink-0 font-tech text-base text-accent transition-transform duration-200 group-hover:translate-x-0.5"
        >
          →
        </span>
      </CyberPanel>
    </m.a>
  )
}

export function EndorsementsSection() {
  return (
    <div className="flex flex-col">
      <SectionHeading
        eyebrow="Dev Community"
        title="Shoutouts"
        subtitle="These are some other cool people and some sites that I think are worth checking out <3"
      />

      {ENDORSEMENTS.length > 0 ? (
        <m.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-10 grid grid-cols-1 gap-4 md:mt-12 md:grid-cols-2 md:gap-5 lg:grid-cols-3"
        >
          {ENDORSEMENTS.map((endorsement) => (
            <EndorsementCard key={endorsement.id} endorsement={endorsement} />
          ))}
        </m.div>
      ) : (
        <p className="mt-10 max-w-md font-body text-base text-muted">
          More to come soon.
        </p>
      )}
    </div>
  )
}
