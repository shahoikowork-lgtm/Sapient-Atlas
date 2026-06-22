'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Eyebrow } from '@/components/atlas'

type Form = {
  name: string
  email: string
  role: string
  seniority: string
  years: string
  company_type: string
  region: string
  income_band: string
  goal: string
  target: string
  unfair_advantages: string
  responsibilities_daily: string
  responsibilities_weekly: string
  work_sample: string
}

const EMPTY: Form = {
  name: '',
  email: '',
  role: '',
  seniority: '',
  years: '',
  company_type: '',
  region: '',
  income_band: '',
  goal: '',
  target: '',
  unfair_advantages: '',
  responsibilities_daily: '',
  responsibilities_weekly: '',
  work_sample: '',
}

const input =
  'w-full rounded-lg border border-hairline bg-surface px-3 py-2.5 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15'
const label = 'mb-1.5 block text-xs font-medium text-muted'

export default function DiagnosisPage() {
  const router = useRouter()
  const [form, setForm] = useState<Form>(EMPTY)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [error, setError] = useState('')

  function set<K extends keyof Form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setError('')
    try {
      const res = await fetch('/api/diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Something went wrong')
      router.push(`/results/${data.token}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  const submitting = status === 'submitting'

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-hairline">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-3.5">
          <span className="font-serif text-base font-semibold tracking-tight">Sapient Atlas</span>
          <span className="text-xs text-muted">No scores. No grades. Just clarity.</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-6 py-14">
        <Eyebrow>See what you can&apos;t see yourself</Eyebrow>
        <h1 className="mt-3 font-serif text-[32px] font-semibold leading-[1.12] tracking-[-0.02em]">
          Show Atlas one real piece of your work.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          The more real the work, the more you&apos;ll see. A campaign, a brief, an analysis, a strategy doc,
          a piece of copy.
        </p>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
          {/* The focal action: paste real work */}
          <div className="rounded-2xl border border-hairline bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-accent">Paste real work</span>
              <span className="text-[11px] text-muted">required</span>
            </div>
            <textarea
              className={`${input} mt-2.5 min-h-[200px] resize-y font-mono text-[13px] leading-relaxed`}
              placeholder="Paste the actual work here. A campaign brief, an analysis, a piece of copy, a strategy doc. The more real, the more you'll see."
              value={form.work_sample}
              onChange={(e) => set('work_sample', e.target.value)}
              required
            />
          </div>

          {/* Required identity */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className={label}>Name *</label>
              <input className={input} value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>
            <div>
              <label className={label}>Email *</label>
              <input className={input} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
            </div>
            <div>
              <label className={label}>Role *</label>
              <input className={input} placeholder="e.g. content marketer, SEO, PM, designer, analyst" value={form.role} onChange={(e) => set('role', e.target.value)} required />
            </div>
          </div>

          {/* Optional context, collapsed */}
          <details className="rounded-xl border border-hairline [&_summary]:cursor-pointer">
            <summary className="flex items-center gap-2 px-4 py-3 text-sm text-muted">
              <span aria-hidden="true">+</span> Add context (optional)
              <span className="ml-auto text-xs text-muted/70">seniority · goals · responsibilities</span>
            </summary>
            <div className="border-t border-hairline p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={label}>Seniority</label>
                  <input className={input} placeholder="e.g. Senior" value={form.seniority} onChange={(e) => set('seniority', e.target.value)} />
                </div>
                <div>
                  <label className={label}>Years in the field</label>
                  <input className={input} value={form.years} onChange={(e) => set('years', e.target.value)} />
                </div>
                <div>
                  <label className={label}>Company type</label>
                  <input className={input} placeholder="e.g. B2B SaaS, agency" value={form.company_type} onChange={(e) => set('company_type', e.target.value)} />
                </div>
                <div>
                  <label className={label}>Region</label>
                  <input className={input} value={form.region} onChange={(e) => set('region', e.target.value)} />
                </div>
                <div>
                  <label className={label}>Income band (optional)</label>
                  <input className={input} value={form.income_band} onChange={(e) => set('income_band', e.target.value)} />
                </div>
                <div>
                  <label className={label}>Your goal</label>
                  <input className={input} placeholder="What you want next" value={form.goal} onChange={(e) => set('goal', e.target.value)} />
                </div>
                <div>
                  <label className={label}>Target</label>
                  <input className={input} placeholder="e.g. lead bigger launches, become harder to replace" value={form.target} onChange={(e) => set('target', e.target.value)} />
                </div>
                <div>
                  <label className={label}>Unfair advantages</label>
                  <input className={input} placeholder="What you have that others don't" value={form.unfair_advantages} onChange={(e) => set('unfair_advantages', e.target.value)} />
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-4">
                <div>
                  <label className={label}>Daily responsibilities</label>
                  <textarea
                    className={`${input} min-h-[80px] resize-y`}
                    placeholder="What a typical day involves, the work you're accountable for."
                    value={form.responsibilities_daily}
                    onChange={(e) => set('responsibilities_daily', e.target.value)}
                  />
                </div>
                <div>
                  <label className={label}>Weekly responsibilities</label>
                  <textarea
                    className={`${input} min-h-[80px] resize-y`}
                    placeholder="What you own on a weekly cadence, the part of the business you're responsible for."
                    value={form.responsibilities_weekly}
                    onChange={(e) => set('responsibilities_weekly', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </details>

          {/* Trust */}
          <div className="flex items-start gap-3 rounded-xl bg-accent-tint px-4 py-3">
            <span className="mt-0.5 text-accent" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
            </span>
            <span className="text-[12.5px] leading-relaxed text-accent-deep">
              Your work stays private, used only to show you what you&apos;re missing. Nothing is shared, nothing is public.
            </span>
          </div>

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          <div className="flex items-center gap-4">
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? 'Reading your work… (~20s)' : 'Find my next move'}
            </Button>
            <span className="text-xs text-muted">takes about 20 seconds</span>
          </div>
        </form>
      </main>
    </div>
  )
}
