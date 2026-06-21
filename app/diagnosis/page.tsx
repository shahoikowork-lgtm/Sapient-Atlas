'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
  'w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-black/50'
const label = 'mb-1 block text-xs font-medium text-black/60'

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
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <header className="mb-10">
        <div className="text-sm font-medium tracking-tight text-black/50">Sapient Atlas</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Where do you actually stand?</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-black/60">
          Paste one real piece of your work. Atlas reads it and returns your capability profile, an honest
          read on where AI is eroding it, and the single highest-leverage move to make next.
        </p>
      </header>

      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <input className={input} placeholder="e.g. Performance marketer" value={form.role} onChange={(e) => set('role', e.target.value)} required />
          </div>
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
            <input className={input} placeholder="e.g. lead bigger launches, build stronger acquisition, become harder to replace" value={form.target} onChange={(e) => set('target', e.target.value)} />
          </div>
        </div>

        <div>
          <label className={label}>Unfair advantages</label>
          <input className={input} placeholder="What you have that others don't" value={form.unfair_advantages} onChange={(e) => set('unfair_advantages', e.target.value)} />
        </div>

        <section className="border-t border-black/10 pt-6">
          <h2 className="text-sm font-semibold">Your responsibilities</h2>
          <p className="mt-1 text-xs leading-relaxed text-black/50">
            What you actually own, day to day and week to week. Scope of ownership is one of the
            strongest signals of real capability.
          </p>
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label className={label}>Daily responsibilities</label>
              <textarea
                className={`${input} min-h-[90px] resize-y`}
                placeholder="What a typical day involves, the work you're accountable for."
                value={form.responsibilities_daily}
                onChange={(e) => set('responsibilities_daily', e.target.value)}
              />
            </div>
            <div>
              <label className={label}>Weekly responsibilities</label>
              <textarea
                className={`${input} min-h-[90px] resize-y`}
                placeholder="What you own on a weekly cadence, the part of the business or operations you're responsible for."
                value={form.responsibilities_weekly}
                onChange={(e) => set('responsibilities_weekly', e.target.value)}
              />
            </div>
          </div>
        </section>

        <div>
          <label className={label}>A real work sample *</label>
          <textarea
            className={`${input} min-h-[180px] resize-y font-mono text-[13px] leading-relaxed`}
            placeholder="Paste real work: a campaign brief you wrote, an analysis, a piece of copy, a strategy doc. The more real, the sharper the read."
            value={form.work_sample}
            onChange={(e) => set('work_sample', e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-black/40">Stays private. Used only to assess your capability.</p>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex items-center justify-center rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-black/85 disabled:opacity-60"
        >
          {submitting ? 'Analyzing your work… (~20s)' : 'Get my capability read'}
        </button>
      </form>
    </main>
  )
}
