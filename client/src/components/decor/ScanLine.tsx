export function ScanLine() {
  return (
    <div
      aria-hidden
      className="animate-scan pointer-events-none fixed inset-x-0 z-[3] h-px opacity-60 sm:opacity-100 motion-reduce:hidden"
      style={{
        background:
          'linear-gradient(to right, transparent, rgb(var(--scanline) / var(--scanline-alpha)), transparent)',
      }}
    />
  )
}
