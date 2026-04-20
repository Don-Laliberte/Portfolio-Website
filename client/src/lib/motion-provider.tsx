'use client'

import { LazyMotion, domAnimation } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Wraps the app in framer-motion's LazyMotion so section files can use the
 * tree-shakeable <m.*> components instead of <motion.*>. Loads the
 * domAnimation feature bundle (~6 KB) on demand — far smaller than the full
 * motion bundle (~30 KB).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>
}
