'use client'

import { m } from 'framer-motion'

interface DividerProps {
  delay?: number
  className?: string
  flip?: boolean
}

export function Divider({ delay = 0, className = '', flip = false }: DividerProps) {
  const diamond = (
    <div
      className="h-1.5 w-1.5 flex-shrink-0 rotate-45"
      style={{
        background: 'rgb(var(--accent))',
        boxShadow: '0 0 8px rgb(var(--accent-bright) / 0.8)',
      }}
    />
  )
  const line = (
    <div
      className="h-px flex-1"
      style={{
        background:
          'linear-gradient(to right, rgb(var(--accent) / 0.9), transparent)',
      }}
    />
  )
  const lineFlipped = (
    <div
      className="h-px flex-1"
      style={{
        background:
          'linear-gradient(to left, rgb(var(--accent) / 0.9), transparent)',
      }}
    />
  )

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay }}
      className={`flex items-center gap-3 ${className}`}
    >
      {flip ? (
        <>
          {diamond}
          {lineFlipped}
        </>
      ) : (
        <>
          {line}
          {diamond}
        </>
      )}
    </m.div>
  )
}
