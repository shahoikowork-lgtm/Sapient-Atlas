export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-3 w-28 rounded bg-s-line" />
      <div className="mt-3 h-7 w-1/2 rounded bg-s-line" />
      <div className="mt-8 flex flex-col gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-s-panel" />
        ))}
      </div>
    </div>
  )
}
