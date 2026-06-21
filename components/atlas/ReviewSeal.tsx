// Recurring trust mark: the human-review gate. Indigo-ringed check + label.
export function ReviewSeal({
  label = 'Reviewed by a human',
  className = '',
}: {
  label?: string
  className?: string
}) {
  return (
    <span className={`inline-flex items-center gap-2 text-[13px] font-medium text-accent ${className}`}>
      <span
        className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-[1.5px] border-accent"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </span>
      {label}
    </span>
  )
}
