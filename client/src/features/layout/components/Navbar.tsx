'use client'

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { Logo } from './Logo'
import { ThemeToggleButton } from './ThemeToggleButton'
import type { NavItem } from '../types'

const SECTION_IDS = ['hero', 'about', 'resume', 'works', 'socials', 'posts'] as const

const NAV_ITEMS: NavItem[] = [
  { href: '#hero', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#resume', label: 'Resume' },
  { href: '#works', label: 'Works' },
  { href: '#socials', label: 'Socials' },
  { href: '#posts', label: 'Posts' },
]

function scrollToSection(href: string) {
  const id = href.startsWith('#') ? href.slice(1) : href
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.pushState(undefined, '', href)
  }
}

function getContainer(): HTMLElement | null {
  if (typeof document === 'undefined') return null
  return document.querySelector<HTMLElement>('.scroll-container')
}

/**
 * External-store subscription to the scroll container. We re-compute the
 * active section on every scroll event and snapshot it via DOM reads so
 * React doesn't drive a setState cascade from inside useEffect.
 */
function subscribeScroll(onChange: () => void) {
  if (typeof window === 'undefined') return () => undefined
  const container = getContainer()
  if (!container) {
    // Container not mounted yet — retry on next frame until it is.
    let raf = 0
    const tick = () => {
      const c = getContainer()
      if (c) {
        c.addEventListener('scroll', onChange, { passive: true })
        onChange()
      } else {
        raf = requestAnimationFrame(tick)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      getContainer()?.removeEventListener('scroll', onChange)
    }
  }
  container.addEventListener('scroll', onChange, { passive: true })
  return () => container.removeEventListener('scroll', onChange)
}

function getActiveSnapshot(): string {
  const container = getContainer()
  if (!container) return SECTION_IDS[0]
  const scrollTop = container.scrollTop
  let active: string = SECTION_IDS[0]
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id)
    if (el && el.offsetTop <= scrollTop + 140) {
      active = id
    }
  }
  return active
}

function getActiveServerSnapshot(): string {
  return SECTION_IDS[0]
}

function NavLink({
  href,
  label,
  active,
  onSelect,
}: {
  href: string
  label: string
  active: boolean
  onSelect: () => void
}) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault()
        scrollToSection(href)
        onSelect()
      }}
      aria-current={active ? 'page' : undefined}
      className="group relative inline-flex min-h-[44px] items-center px-3 py-2 font-tech text-base font-normal uppercase tracking-[0.16em] transition-colors duration-200"
      style={{ color: active ? 'rgb(var(--accent-bright))' : 'rgb(var(--text) / 0.7)' }}
    >
      <span>{label}</span>
      <span
        aria-hidden
        className={`absolute inset-x-3 bottom-1 h-px origin-left transition-transform duration-300 ${
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`}
        style={{ background: 'rgb(var(--accent-bright))' }}
      />
    </a>
  )
}

export function Navbar() {
  const activeSectionId = useSyncExternalStore(
    subscribeScroll,
    getActiveSnapshot,
    getActiveServerSnapshot,
  )
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <header
      className="sticky top-0 z-40 w-full safe-inset-top"
      style={{
        background: 'rgb(var(--bg-ink) / 0.78)',
        WebkitBackdropFilter: 'blur(10px)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgb(var(--border) / 0.2)',
      }}
    >
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-4 py-2 md:px-6">
        <Logo onHomeClick={() => scrollToSection('#hero')} />

        {/* Desktop: nav links + theme toggle share one cross-axis-aligned row */}
        <div className="hidden min-h-0 min-w-0 shrink-0 items-center gap-1 md:flex">
          <nav aria-label="Primary" className="flex min-h-0 items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                active={activeSectionId === item.href.slice(1)}
                onSelect={closeMenu}
              />
            ))}
          </nav>
          <div className="flex shrink-0 items-center pl-2 md:pl-3">
            <ThemeToggleButton />
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex shrink-0 items-center gap-2 md:hidden">
          <ThemeToggleButton />
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors"
            style={{
              border: '1px solid rgb(var(--border) / 0.55)',
              background: 'rgb(var(--accent) / 0.12)',
              color: 'rgb(var(--accent-bright))',
            }}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <m.nav
            id="mobile-nav"
            aria-label="Primary mobile"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden"
            style={{
              background: 'rgb(var(--bg-ink) / 0.96)',
              borderBottom: '1px solid rgb(var(--border) / 0.25)',
            }}
          >
            <ul className="mx-auto flex w-full max-w-[1280px] flex-col px-4 py-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <NavLink
                    href={item.href}
                    label={item.label}
                    active={activeSectionId === item.href.slice(1)}
                    onSelect={closeMenu}
                  />
                </li>
              ))}
            </ul>
          </m.nav>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
