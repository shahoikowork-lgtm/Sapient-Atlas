import Link from 'next/link'

// Stripe Checkout redirects here on success. Public page (sprint is pre-auth).
// Fulfillment happens in the webhook, not here, this is confirmation only.
export default async function UpgradeSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  await searchParams // present for completeness; fulfillment is webhook-driven

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-4 px-6">
      <div className="text-sm font-medium text-black/50">Sapient Atlas</div>
      <h1 className="text-2xl font-semibold tracking-tight">You&apos;re in. Your Why-You Sprint is active.</h1>
      <p className="text-[15px] leading-relaxed text-black/65">
        Over the next 30 days we turn your one move into a concrete plan on your real work, check your
        progress weekly, and re-rate your capability profile at the end.
      </p>
      <div>
        <Link
          href="/app"
          className="inline-flex items-center justify-center rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-black/85"
        >
          Open your workspace
        </Link>
      </div>
      <p className="text-sm text-black/45">
        Sign in with the email you used at checkout. A receipt is on its way to your inbox.
      </p>
    </main>
  )
}
