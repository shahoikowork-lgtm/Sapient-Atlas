// Minimal footer: wordmark + tagline on a hairline. Surface-aware (paper + instrument).
export function Footer() {
  return (
    <footer className="border-t border-s-line px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 text-label text-s-muted sm:flex-row sm:items-center">
        <span className="font-semibold text-s-text">Sapient Atlas</span>
        <span className="italic">The Art of Becoming Harder to Replace</span>
      </div>
    </footer>
  )
}
