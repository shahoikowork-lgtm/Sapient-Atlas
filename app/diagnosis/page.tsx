'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Button, Eyebrow, Field, AnalysisState } from '@/components/atlas'

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function DiagnosisPage() {
  const router = useRouter()
  const reduce = useReducedMotion()
  const [form, setForm] = useState<Form>(EMPTY)
  const [step, setStep] = useState<1 | 2>(1)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({})
  const step2Ref = useRef<HTMLDivElement>(null)
  const workRef = useRef<HTMLTextAreaElement>(null)

  function set<K extends keyof Form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e))
  }

  const workReady = form.work_sample.trim().length > 0
  const wordCount = workReady ? form.work_sample.trim().split(/\s+/).length : 0

  function continueToStep2() {
    // Read the latest value straight from the field as a fallback, so an early paste,
    // autofill, or a React state lag can never leave the user stuck on a dead button.
    const live = workRef.current?.value ?? form.work_sample
    if (live.trim().length === 0) {
      setErrors((e) => ({ ...e, work_sample: 'Paste your work to continue.' }))
      return
    }
    // Sync state if the field is ahead of React (e.g. text entered before hydration).
    if (live !== form.work_sample) setForm((f) => ({ ...f, work_sample: live }))
    setErrors((e) => (e.work_sample ? { ...e, work_sample: undefined } : e))
    setStep(2)
    requestAnimationFrame(() => step2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  function validateStep2(): Partial<Record<keyof Form, string>> {
    const next: Partial<Record<keyof Form, string>> = {}
    if (!form.email.trim()) next.email = 'This field is required.'
    else if (!EMAIL_RE.test(form.email.trim())) next.email = 'Enter a valid email address.'
    if (!form.role.trim()) next.role = 'This field is required.'
    if (!workReady) next.work_sample = 'Paste one real piece of your work to continue.'
    return next
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const found = validateStep2()
    if (Object.keys(found).length > 0) {
      setErrors(found)
      if (found.work_sample) setStep(1)
      return
    }
    setStatus('submitting')
    setError('')
    try {
      // Same contract: the full form (required + optional) is posted unchanged, and on
      // success we redirect to /results/[token].
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

  // The designed wait takes over the screen during analysis, in the instrument register.
  if (status === 'submitting') {
    return (
      <div className="instrument min-h-screen bg-s-bg text-s-text">
        <AnalysisState />
      </div>
    )
  }

  const reveal = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
      }

  return (
    <div className="instrument min-h-screen bg-s-bg text-s-text">
      <header className="sticky top-0 z-20 border-b border-s-line bg-s-bg/80 backdrop-blur supports-[backdrop-filter]:bg-s-bg/70">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-3.5">
          <a href="/" className="font-semibold tracking-tight text-s-text transition-opacity hover:opacity-70">
            Sapient Atlas
          </a>
          <span className="text-label text-s-muted tabular">Step {step} of 2</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-6 py-14">
        <Eyebrow>See what you can’t see yourself</Eyebrow>
        <h1 className="mt-3 text-h1 text-s-text">Show Atlas one real piece of your work.</h1>
        <p className="mt-3 text-body text-s-text-2">
          The more real the work, the more you’ll see. A campaign, a brief, an analysis, a strategy
          doc, a piece of copy.
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-8 flex flex-col gap-6">
          {/* STEP 1 — the work is the hero of the page. */}
          <div
            className={`rounded-2xl border bg-s-panel p-4 transition-colors ${
              errors.work_sample ? 'border-s-danger' : 'border-s-line focus-within:border-s-accent/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <label htmlFor="work_sample" className="font-mono text-eyebrow uppercase text-s-accent">
                Paste real work
              </label>
              <span className="text-[11px] text-s-muted">required</span>
            </div>
            <textarea
              ref={workRef}
              id="work_sample"
              name="work_sample"
              className={`mt-2.5 min-h-[220px] w-full resize-y rounded-lg border bg-s-bg px-3 py-2.5 font-mono text-[13px] leading-relaxed text-s-text outline-none transition-colors placeholder:text-s-muted/60 ${
                errors.work_sample
                  ? 'border-s-danger focus:ring-2 focus:ring-s-danger/20'
                  : 'border-s-line hover:border-s-line-strong focus:border-s-accent focus:ring-2 focus:ring-s-accent/20'
              }`}
              placeholder="Paste the actual work here. A campaign brief, an analysis, a piece of copy, a strategy doc. The more real, the more you’ll see."
              value={form.work_sample}
              onChange={(e) => set('work_sample', e.target.value)}
              required
              aria-required="true"
              aria-invalid={!!errors.work_sample}
              aria-describedby={errors.work_sample ? 'work_sample-error' : 'work_sample-hint'}
            />
            <div className="mt-2 flex items-center justify-between">
              {errors.work_sample ? (
                <p id="work_sample-error" role="alert" className="text-[12.5px] text-s-danger">
                  {errors.work_sample}
                </p>
              ) : (
                <span />
              )}
              <span id="work_sample-hint" className="text-[11px] text-s-muted tabular">
                {wordCount > 0 ? `${wordCount} word${wordCount === 1 ? '' : 's'}` : 'Your work stays private'}
              </span>
            </div>
          </div>

          {step === 1 ? (
            <div className="flex items-center gap-4">
              <Button type="button" size="lg" onClick={continueToStep2}>
                Continue
              </Button>
              <span className="text-label text-s-muted">Then one or two quick details.</span>
            </div>
          ) : (
            <motion.div ref={step2Ref} {...reveal} className="flex flex-col gap-6">
              {/* STEP 2 — value-gated identity, minimal. */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  id="email"
                  label="Where should we send it?"
                  type="email"
                  value={form.email}
                  onChange={(v) => set('email', v)}
                  onBlur={() =>
                    setErrors((e) => ({
                      ...e,
                      email: !form.email.trim()
                        ? 'This field is required.'
                        : !EMAIL_RE.test(form.email.trim())
                          ? 'Enter a valid email address.'
                          : undefined,
                    }))
                  }
                  required
                  error={errors.email}
                  autoComplete="email"
                  placeholder="you@work.com"
                />
                <Field
                  id="role"
                  label="Your role"
                  value={form.role}
                  onChange={(v) => set('role', v)}
                  onBlur={() => setErrors((e) => ({ ...e, role: form.role.trim() ? undefined : 'This field is required.' }))}
                  required
                  error={errors.role}
                  placeholder="e.g. content marketer, SEO, PM, designer, analyst"
                  autoComplete="organization-title"
                />
              </div>

              {/* Optional context — after the work, never competing with it. */}
              <details className="group rounded-xl border border-s-line transition-colors hover:border-s-line-strong [&_summary]:cursor-pointer">
                <summary className="flex items-center gap-2 px-4 py-3 text-sm text-s-muted transition-colors hover:text-s-text">
                  <span aria-hidden="true" className="transition-transform group-open:rotate-45">+</span>
                  Add context (optional)
                  <span className="ml-auto text-xs text-s-muted">name · seniority · goals · responsibilities</span>
                </summary>
                <div className="grid grid-cols-1 gap-4 border-t border-s-line p-4 sm:grid-cols-2">
                  <Field id="name" label="Name" value={form.name} onChange={(v) => set('name', v)} autoComplete="name" />
                  <Field id="seniority" label="Seniority" value={form.seniority} onChange={(v) => set('seniority', v)} placeholder="e.g. Senior" />
                  <Field id="years" label="Years in the field" value={form.years} onChange={(v) => set('years', v)} inputMode="numeric" />
                  <Field id="company_type" label="Company type" value={form.company_type} onChange={(v) => set('company_type', v)} placeholder="e.g. B2B SaaS, agency" />
                  <Field id="region" label="Region" value={form.region} onChange={(v) => set('region', v)} />
                  <Field id="income_band" label="Income band" value={form.income_band} onChange={(v) => set('income_band', v)} />
                  <Field id="goal" label="Your goal" value={form.goal} onChange={(v) => set('goal', v)} placeholder="What you want next" />
                  <Field id="target" label="Target" value={form.target} onChange={(v) => set('target', v)} placeholder="e.g. lead bigger launches" />
                  <Field id="unfair_advantages" label="Unfair advantages" value={form.unfair_advantages} onChange={(v) => set('unfair_advantages', v)} placeholder="What you have that others don't" className="sm:col-span-2" />
                  <Field id="responsibilities_daily" label="Daily responsibilities" type="textarea" rows={3} value={form.responsibilities_daily} onChange={(v) => set('responsibilities_daily', v)} placeholder="What a typical day involves." />
                  <Field id="responsibilities_weekly" label="Weekly responsibilities" type="textarea" rows={3} value={form.responsibilities_weekly} onChange={(v) => set('responsibilities_weekly', v)} placeholder="What you own on a weekly cadence." />
                </div>
              </details>

              {/* Trust */}
              <div className="flex items-start gap-3 rounded-xl bg-s-accent-tint px-4 py-3">
                <span className="mt-0.5 text-s-accent" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
                </span>
                <span className="text-[12.5px] leading-relaxed text-s-text-2">
                  Your work stays private, used only to show you what you’re missing. Nothing is shared, nothing is public.
                </span>
              </div>

              <AnimatePresence initial={false}>
                {error ? (
                  <motion.div
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-lg border border-s-danger/30 bg-s-danger-tint px-4 py-3 text-sm text-s-danger"
                  >
                    {error}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="flex items-center gap-4">
                <Button type="submit" size="lg" className="min-w-[12rem]">
                  Get my diagnosis
                </Button>
                <span className="text-label text-s-muted">takes about 20 seconds</span>
              </div>
            </motion.div>
          )}
        </form>
      </main>
    </div>
  )
}
