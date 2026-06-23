// Instant shell on navigation so sections never open into a blank wait.
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-3 w-24 rounded bg-s-line" />
      <div className="mt-3 h-8 w-2/3 rounded bg-s-line" />
      <div className="mt-8 h-48 rounded-3xl bg-s-panel" />
      <div className="mt-4 h-4 w-1/2 rounded bg-s-line" />
    </div>
  )
}
