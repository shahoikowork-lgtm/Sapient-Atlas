// Stripe Checkout redirects here if the user backs out. No charge was made.
export default function UpgradeCancelPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-4 px-6">
      <div className="text-sm font-medium text-black/50">Sapient Atlas</div>
      <h1 className="text-2xl font-semibold tracking-tight">Checkout canceled, no charge.</h1>
      <p className="text-[15px] leading-relaxed text-black/65">
        Nothing was billed. Your diagnosis is still saved; you can start your Value Sprint whenever
        you&apos;re ready from your results page.
      </p>
    </main>
  )
}
