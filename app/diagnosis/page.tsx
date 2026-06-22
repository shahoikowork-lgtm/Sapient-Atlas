'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
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

// Required fields, validated client-side for fast, clear feedback. The POST body is
// unchanged: the full Form (required + optional) is still sent to /api/diagnosis.
const REQUIRED: (keyof Form)[] = ['work_sample', 'name', 'email', 'role']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const inputBase =
  'w-full rounded-lg border bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/50'
const inputOk = 'border-hairline hover:border-muted/40 focus:border-accent focus:ring-2 focus:ring-accent/15'
const inputErr = 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/15'
const label = 'mb-1.5 block text-xs font-medium text-muted'

function fieldClass(hasError: boolean) {
  return `${inputBase} ${hasError ? inputErr : inputOk}`
}

// Small, accessible error line tied to its field via aria-describedby. Fades in quietly.
function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.p
          id={id}
          role="alert"
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="mt-1.5 text-[12.5px] text-red-700"
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  )
}

export default function DiagnosisPage() {
  const router = useRouter()
  const reduce = useReducedMotion()
  const [form, setForm] = useState<Form>(EMPTY)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({})
  const formRef = useRef<HTMLFormElement>(null)

  function set<K extends keyof Form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
    // Clear a field's error as soon as the user starts fixing it.
    setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e))
  }

  function fieldError(k: keyof Form, value: string): string | undefined {
    const v = value.trim()
    if (REQUIRED.includes(k) && !v) {
      if (k === 'work_sample') return 'Paste one real piece of your work to continue.'
      return 'This field is required.'
    }
    if (k === 'email' && v && !EMAIL_RE.test(v)) return 'Enter a valid email address.'
    return undefined
  }

  function validate(): Partial<Record<keyof Form, string>> {
    const next: Partial<Record<keyof Form, string>> = {}
    for (const k of REQUIRED) {
      const msg = fieldError(k, form[k])
      if (msg) next[k] = msg
    }
    return next
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    const found = validate()
    if (Object.keys(found).length > 0) {
      setErrors(found)
      setStatus('idle')
      // Move focus to the first invalid field for keyboard + screen-reader users.
      const firstKey = (REQUIRED.find((k) => found[k]) ?? 'work_sample') as string
      formRef.current?.querySelector<HTMLElement>(`#field-${firstKey}`)?.focus()
      return
    }

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
  const wordCount = form.work_sample.trim() ? form.work_sample.trim().split(/\s+/).length : 0

  const intro = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
      }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-10 border-b border-hairline bg-paper/80 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-3.5">
          <a href="/" className="font-serif text-base font-semibold tracking-tight transition-opacity hover:opacity-70">
            Sapient Atlas
          </a>
          <span className="text-xs text-muted">No scores. No grades. Just clarity.</span>
        </div>
      </header>

      <motion.main {...intro} className="mx-auto w-full max-w-2xl px-6 py-14">
        <Eyebrow>See what you can&apos;t see yourself</Eyebrow>
        <h1 className="mt-3 font-serif text-[32px] font-semibold leading-[1.12] tracking-[-0.02em]">
          Show Atlas one real piece of your work.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          The more real the work, the more you&apos;ll see. A campaign, a brief, an analysis, a strategy doc,
          a piece of copy.
        </p>

        <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-8 flex flex-col gap-5">
          {/* The focal action: paste real work */}
          <div
            className={`rounded-2xl border bg-surface p-4 transition-colors ${
              errors.work_sample ? 'border-red-400' : 'border-hairline focus-within:border-accent/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <label
                htmlFor="field-work_sample"
                className="font-mono text-[11px] uppercase tracking-[0.1em] text-accent"
              >
                Paste real work
              </label>
              <span className="text-[11px] text-muted">required</span>
            </div>
            <textarea
              id="field-work_sample"
              name="work_sample"
              className={`${fieldClass(!!errors.work_sample)} mt-2.5 min-h-[200px] resize-y font-mono text-[13px] leading-relaxed`}
              placeholder="Paste the actual work here. A campaign brief, an analysis, a piece of copy, a strategy doc. The more real, the more you'll see."
              value={form.work_sample}
              onChange={(e) => set('work_sample', e.target.value)}
              onBlur={(e) => setErrors((er) => ({ ...er, work_sample: fieldError('work_sample', e.target.value) }))}
              required
              aria-required="true"
              aria-invalid={!!errors.work_sample}
              aria-describedby={errors.work_sample ? 'err-work_sample' : 'hint-work_sample'}
            />
            <div className="mt-2 flex items-center justify-between">
              <FieldError id="err-work_sample" message={errors.work_sample} />
              <span id="hint-work_sample" className="ml-auto text-[11px] text-muted/70 tabular">
                {wordCount > 0 ? `${wordCount} word${wordCount === 1 ? '' : 's'}` : 'Your work stays private'}
              </span>
            </div>
          </div>

          {/* Required identity */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="field-name" className={label}>
                Name <span aria-hidden="true">*</span>
              </label>
              <input
                id="field-name"
                name="name"
                className={fieldClass(!!errors.name)}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                onBlur={(e) => setErrors((er) => ({ ...er, name: fieldError('name', e.target.value) }))}
                required
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'err-name' : undefined}
                autoComplete="name"
              />
              <FieldError id="err-name" message={errors.name} />
            </div>
            <div>
              <label htmlFor="field-email" className={label}>
                Email <span aria-hidden="true">*</span>
              </label>
              <input
                id="field-email"
                name="email"
                type="email"
                className={fieldClass(!!errors.email)}
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                onBlur={(e) => setErrors((er) => ({ ...er, email: fieldError('email', e.target.value) }))}
                required
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'err-email' : undefined}
                autoComplete="email"
              />
              <FieldError id="err-email" message={errors.email} />
            </div>
            <div>
              <label htmlFor="field-role" className={label}>
                Role <span aria-hidden="true">*</span>
              </label>
              <input
                id="field-role"
                name="role"
                className={fieldClass(!!errors.role)}
                placeholder="e.g. content marketer, SEO, PM, designer, analyst"
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
                onBlur={(e) => setErrors((er) => ({ ...er, role: fieldError('role', e.target.value) }))}
                required
                aria-required="true"
                aria-invalid={!!errors.role}
                aria-describedby={errors.role ? 'err-role' : undefined}
                autoComplete="organization-title"
              />
              <FieldError id="err-role" message={errors.role} />
            </div>
          </div>

          {/* Optional context, collapsed */}
          <details className="group rounded-xl border border-hairline transition-colors hover:border-muted/40 [&_summary]:cursor-pointer">
            <summary className="flex items-center gap-2 px-4 py-3 text-sm text-muted transition-colors hover:text-ink">
              <span aria-hidden="true" className="transition-transform group-open:rotate-45">
                +
              </span>{' '}
              Add context (optional)
              <span className="ml-auto text-xs text-muted/70">seniority · goals · responsibilities</span>
            </summary>
            <div className="border-t border-hairline p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="field-seniority" className={label}>
                    Seniority
                  </label>
                  <input id="field-seniority" name="seniority" className={fieldClass(false)} placeholder="e.g. Senior" value={form.seniority} onChange={(e) => set('seniority', e.target.value)} />
                </div>
                <div>
                  <label htmlFor="field-years" className={label}>
                    Years in the field
                  </label>
                  <input id="field-years" name="years" className={fieldClass(false)} inputMode="numeric" value={form.years} onChange={(e) => set('years', e.target.value)} />
                </div>
                <div>
                  <label htmlFor="field-company_type" className={label}>
                    Company type
                  </label>
                  <input id="field-company_type" name="company_type" className={fieldClass(false)} placeholder="e.g. B2B SaaS, agency" value={form.company_type} onChange={(e) => set('company_type', e.target.value)} />
                </div>
                <div>
                  <label htmlFor="field-region" className={label}>
                    Region
                  </label>
                  <input id="field-region" name="region" className={fieldClass(false)} value={form.region} onChange={(e) => set('region', e.target.value)} />
                </div>
                <div>
                  <label htmlFor="field-income_band" className={label}>
                    Income band (optional)
                  </label>
                  <input id="field-income_band" name="income_band" className={fieldClass(false)} value={form.income_band} onChange={(e) => set('income_band', e.target.value)} />
                </div>
                <div>
                  <label htmlFor="field-goal" className={label}>
                    Your goal
                  </label>
                  <input id="field-goal" name="goal" className={fieldClass(false)} placeholder="What you want next" value={form.goal} onChange={(e) => set('goal', e.target.value)} />
                </div>
                <div>
                  <label htmlFor="field-target" className={label}>
                    Target
                  </label>
                  <input id="field-target" name="target" className={fieldClass(false)} placeholder="e.g. lead bigger launches, become harder to replace" value={form.target} onChange={(e) => set('target', e.target.value)} />
                </div>
                <div>
                  <label htmlFor="field-unfair_advantages" className={label}>
                    Unfair advantages
                  </label>
                  <input id="field-unfair_advantages" name="unfair_advantages" className={fieldClass(false)} placeholder="What you have that others don't" value={form.unfair_advantages} onChange={(e) => set('unfair_advantages', e.target.value)} />
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-4">
                <div>
                  <label htmlFor="field-responsibilities_daily" className={label}>
                    Daily responsibilities
                  </label>
                  <textarea
                    id="field-responsibilities_daily"
                    name="responsibilities_daily"
                    className={`${fieldClass(false)} min-h-[80px] resize-y`}
                    placeholder="What a typical day involves, the work you're accountable for."
                    value={form.responsibilities_daily}
                    onChange={(e) => set('responsibilities_daily', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="field-responsibilities_weekly" className={label}>
                    Weekly responsibilities
                  </label>
                  <textarea
                    id="field-responsibilities_weekly"
                    name="responsibilities_weekly"
                    className={`${fieldClass(false)} min-h-[80px] resize-y`}
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

          {/* Submit-level error (server / network) */}
          <AnimatePresence initial={false}>
            {error ? (
              <motion.div
                role="alert"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="flex items-center gap-4">
            <Button type="submit" size="lg" disabled={submitting} aria-busy={submitting} className="min-w-[12rem]">
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-90" d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Reading your work…
                </span>
              ) : (
                'Find my next move'
              )}
            </Button>
            <span className="text-xs text-muted" aria-live="polite">
              {submitting ? 'about 20 seconds' : 'takes about 20 seconds'}
            </span>
          </div>
        </form>
      </motion.main>
    </div>
  )
}
