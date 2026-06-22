'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { ChangeEvent } from 'react'

// The accessibility contract in one place: label + control + error + hint, wired with
// htmlFor/id, aria-required, aria-invalid, aria-describedby, and a role="alert" error.
// One component so no page re-implements form a11y.

type FieldType = 'text' | 'email' | 'textarea' | 'select'

export function FieldError({ id, message }: { id: string; message?: string }) {
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
          className="mt-1.5 text-[12.5px] text-danger"
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  )
}

const controlBase =
  'w-full rounded-lg border bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 min-h-11'
const ok = 'border-hairline hover:border-hairline-strong focus:border-accent focus:ring-2 focus:ring-accent/15'
const bad = 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/15'

export function Field({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  required = false,
  error,
  hint,
  placeholder,
  autoComplete,
  inputMode,
  options,
  rows = 4,
  voice = 'sans',
  className = '',
}: {
  id: string
  label: string
  type?: FieldType
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  required?: boolean
  error?: string
  hint?: string
  placeholder?: string
  autoComplete?: string
  inputMode?: 'numeric' | 'text' | 'email'
  options?: { value: string; label: string }[]
  rows?: number
  voice?: 'sans' | 'mono'
  className?: string
}) {
  const cls = `${controlBase} ${error ? bad : ok} ${voice === 'mono' ? 'font-mono text-[13px] leading-relaxed' : ''}`
  const errId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error ? errId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined
  const handle = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    onChange(e.target.value)

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-label text-text-secondary">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>

      {type === 'textarea' ? (
        <textarea
          id={id}
          name={id}
          className={`${cls} resize-y`}
          style={{ minHeight: rows * 24 }}
          value={value}
          onChange={handle}
          onBlur={onBlur}
          required={required}
          aria-required={required || undefined}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
          placeholder={placeholder}
        />
      ) : type === 'select' ? (
        <select
          id={id}
          name={id}
          className={cls}
          value={value}
          onChange={handle}
          onBlur={onBlur}
          required={required}
          aria-required={required || undefined}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
        >
          <option value="" disabled>
            {placeholder ?? 'Select…'}
          </option>
          {options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          className={cls}
          value={value}
          onChange={handle}
          onBlur={onBlur}
          required={required}
          aria-required={required || undefined}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
        />
      )}

      {hint && !error ? (
        <p id={hintId} className="mt-1.5 text-[12px] text-muted">
          {hint}
        </p>
      ) : null}
      <FieldError id={errId} message={error} />
    </div>
  )
}
