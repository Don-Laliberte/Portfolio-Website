import { createElement } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'

type PanelTag = 'div' | 'section' | 'article' | 'aside' | 'a' | 'button'

interface CyberPanelProps extends HTMLAttributes<HTMLElement> {
  as?: PanelTag
  stripe?: boolean
  hover?: boolean
  children?: ReactNode
}

export function CyberPanel({
  as,
  stripe = true,
  hover = false,
  className = '',
  children,
  ...rest
}: CyberPanelProps) {
  const Tag = as ?? 'div'
  const classes = [
    'cyber-panel',
    stripe ? 'cyber-panel-stripe' : '',
    hover ? 'cyber-panel-hover' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return createElement(Tag, { className: classes, ...rest }, children)
}
