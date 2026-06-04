const Corner = ({ className }: { className: string }) => (
  <div
    className={`pointer-events-none fixed z-10 h-9 w-9 sm:h-[55px] sm:w-[55px] ${className}`}
    aria-hidden
  >
    <div
      className="absolute left-0 top-0 h-px w-full bg-border opacity-70"
    />
    <div
      className="absolute left-0 top-0 h-full w-px bg-border opacity-70"
    />
  </div>
)

export function CornerBrackets() {
  return (
    <>
      <Corner className="left-2 top-2 sm:left-3.5 sm:top-3.5 safe-inset-top safe-inset-left" />
      <Corner className="right-2 top-2 rotate-90 sm:right-3.5 sm:top-3.5 safe-inset-top safe-inset-right" />
      <Corner className="bottom-2 right-2 rotate-180 sm:bottom-3.5 sm:right-3.5 safe-inset-bottom safe-inset-right" />
      <Corner className="bottom-2 left-2 -rotate-90 sm:bottom-3.5 sm:left-3.5 safe-inset-bottom safe-inset-left" />
      <div
        className="pointer-events-none fixed inset-2 z-[2] border border-frame sm:inset-3.5"
        aria-hidden
      />
    </>
  )
}
