import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resume | Don Laliberte',
  description: 'Don H. Laliberte — Full Stack Developer resume',
}

export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
