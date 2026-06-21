import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { UpgradeCta } from './upgrade-cta'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function money(n: number | null, currency = 'USD') {
  if (n == null) return ', '
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
  } catch {
    return `$${Math.round(n).toLocaleString('en-US')}`
  }
}

// Pre-auth, token-gated. Reads via service role (RLS would return nothing to an
// anonymous visitor); only APPROVED output is ever shown.
export default async function ResultsPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: diag } = await admin
    .from('diagnoses')
    .select('user_id')
    .eq('result_token', token)
    .maybeSingle()
  if (!diag) notFound()

  const { data: va } = await admin
    .from('value_assessments')
    .select('*')
    .eq('user_id', diag.user_id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: move } = await admin
    .from('moves')
    .select('*')
    .eq('user_id', diag.user_id)
    .in('status', ['approved', 'active', 'completed'])
    .order('assigned_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!va || !move) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-3 px-6">
        <div className="text-sm font-medium text-black/50">Sapient Atlas</div>
        <h1 className="text-2xl font-semibold tracking-tight">Your diagnosis is being reviewed.</h1>
        <p className="text-[15px] leading-relaxed text-black/60">
          Every Atlas assessment is checked by a human before you see it. Your market value and your
          single highest-leverage move will appear here shortly, keep this link.
        </p>
      </main>
    )
  }

  const { data: prediction } = await admin
    .from('predictions')
    .select('*')
    .eq('move_id', move.id)
    .maybeSingle()

  const capabilities: Record<string, { score: number; evidence: string }> = va.capability_scores ?? {}
  const gaps: { title: string; detail: string }[] = va.gaps ?? []
  const pcd = prediction?.pred_capability_delta as
    | { dimension: string; from: number; to: number }
    | undefined

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="text-sm font-medium text-black/50">Sapient Atlas · Your diagnosis</div>

      {/* Value */}
      <section className="mt-6">
        <div className="text-xs font-medium uppercase tracking-wide text-black/40">Current market value</div>
        <div className="mt-2 flex items-baseline gap-2 font-mono text-3xl font-semibold tracking-tight">
          <span>{money(va.value_low, va.currency)}</span>
          <span className="text-black/30">–</span>
          <span>{money(va.value_high, va.currency)}</span>
        </div>
        <div className="mt-1 text-sm text-black/50">
          Midpoint {money(va.value_mid, va.currency)} · confidence <strong>{va.confidence}</strong>
        </div>
        {va.confidence_reason ? (
          <p className="mt-3 text-[15px] leading-relaxed text-black/70">{va.confidence_reason}</p>
        ) : null}
      </section>

      {/* Trajectory + AI exposure */}
      <section className="mt-8 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-black/10 p-4">
          <div className="text-xs uppercase tracking-wide text-black/40">Trajectory</div>
          <div className="mt-1 text-lg font-medium capitalize">{va.trajectory ?? ', '}</div>
        </div>
        <div className="rounded-xl border border-black/10 p-4">
          <div className="text-xs uppercase tracking-wide text-black/40">AI exposure</div>
          <div className="mt-1 text-lg font-medium">
            {va.ai_exposure != null ? `${Math.round(va.ai_exposure * 100)}%` : ', '}
          </div>
        </div>
      </section>

      {va.observation ? (
        <p className="mt-8 border-l-2 border-black/80 pl-4 text-[15px] leading-relaxed text-black/80">
          {va.observation}
        </p>
      ) : null}

      {/* Capabilities (evidence-backed) */}
      {Object.keys(capabilities).length > 0 ? (
        <section className="mt-10">
          <h2 className="text-sm font-semibold">Capability read</h2>
          <div className="mt-3 flex flex-col gap-3">
            {Object.entries(capabilities).map(([dim, c]) => (
              <div key={dim} className="rounded-xl border border-black/10 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{dim}</span>
                  <span className="font-mono text-sm text-black/60">{c.score}/100</span>
                </div>
                {c.evidence ? <p className="mt-1.5 text-[13px] leading-relaxed text-black/55">{c.evidence}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Gaps */}
      {gaps.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-sm font-semibold">What caps your value</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {gaps.map((g, i) => (
              <li key={i} className="text-[14px] leading-relaxed text-black/70">
                <span className="font-medium text-black/90">{g.title}.</span> {g.detail}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* The one move */}
      <section className="mt-12 rounded-2xl bg-black p-6 text-white">
        <div className="text-xs font-medium uppercase tracking-wide text-white/50">Your next move</div>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">{move.title}</h2>
        {move.thesis ? <p className="mt-2 text-[15px] leading-relaxed text-white/75">{move.thesis}</p> : null}
        {move.target_outcome ? (
          <div className="mt-4">
            <div className="text-xs uppercase tracking-wide text-white/40">Target outcome</div>
            <div className="mt-1 text-sm text-white/85">{move.target_outcome}</div>
          </div>
        ) : null}
        {move.reasoning ? (
          <div className="mt-4">
            <div className="text-xs uppercase tracking-wide text-white/40">Why this, and why now</div>
            <p className="mt-1 text-[14px] leading-relaxed text-white/75">{move.reasoning}</p>
          </div>
        ) : null}
        <div className="mt-4 text-xs text-white/50">Confidence: {move.confidence ?? ', '}</div>
      </section>

      {/* Falsifiable prediction (Trust System) */}
      {prediction ? (
        <section className="mt-6 rounded-2xl border border-black/10 p-6">
          <div className="text-xs font-medium uppercase tracking-wide text-black/40">
            The prediction we&apos;ll check in {prediction.horizon_days ?? 30} days
          </div>
          {pcd ? (
            <p className="mt-2 text-[15px] leading-relaxed text-black/80">
              <span className="font-medium capitalize">{pcd.dimension}</span>: {pcd.from} →{' '}
              <span className="font-medium">{pcd.to}</span>
              {prediction.pred_value_delta != null ? (
                <> · expected value change {money(prediction.pred_value_delta, va.currency)}</>
              ) : null}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-black/40">
            We log this now and grade it honestly later, hit, partial, or miss.
          </p>
        </section>
      ) : null}

      <UpgradeCta token={token} />
    </main>
  )
}
