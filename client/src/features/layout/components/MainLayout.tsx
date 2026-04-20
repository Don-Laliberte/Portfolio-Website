'use client'

import { useEffect } from 'react'
import { Navbar } from './Navbar'
import { CornerBrackets } from '@/components/decor/CornerBrackets'
import { ScanLine } from '@/components/decor/ScanLine'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  useEffect(() => {
    document.body.classList.add('single-scroll-layout')
    return () => document.body.classList.remove('single-scroll-layout')
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash
    if (!hash) return
    const id = hash.slice(1)
    const scrollToSection = () => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' })
    }
    const raf = requestAnimationFrame(() => requestAnimationFrame(scrollToSection))
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <>
      <CornerBrackets />
      <ScanLine />
      <main className="relative">
        <div className="scroll-container">
          <Navbar />
          {children}
        </div>
      </main>
    </>
  )
}
