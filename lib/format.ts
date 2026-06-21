export function money(n: number | null | undefined, currency = 'USD') {
  if (n == null) return '-'
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
  } catch {
    return `$${Math.round(n).toLocaleString('en-US')}`
  }
}

// Display-only relabel of the stored trajectory enum (rising | holding | slipping) as a
// capability / market-relevance trajectory. The schema and engine output are unchanged;
// this only changes how the existing value is presented to the user.
export function trajectoryLabel(t: string | null | undefined): string {
  switch (t) {
    case 'rising':
      return 'Improving'
    case 'holding':
      return 'Stable'
    case 'slipping':
      return 'Declining'
    default:
      return 'Unknown'
  }
}

// Display-only qualitative labels. The backend keeps the raw 0-100 scores; these map
// them to qualitative language so the UI never shows a fake-precise number.
export function leverageLabel(score: number | null | undefined): string {
  if (score == null) return ''
  if (score >= 70) return 'High leverage'
  if (score >= 40) return 'Medium leverage'
  return 'Low leverage'
}

export function weekLabel(score: number | null | undefined): string {
  if (score == null) return ''
  if (score >= 75) return 'Strong week'
  if (score >= 60) return 'On track'
  if (score >= 45) return 'Partial progress'
  return 'Stalled'
}

export function aiExposureLabel(x: number | null | undefined): string {
  if (x == null) return ''
  if (x > 0.66) return 'High'
  if (x >= 0.34) return 'Moderate'
  return 'Low'
}

// Display-only: turn a snake_case capability key into natural language.
// "product_thinking" -> "Product thinking", "ai_workflow_design" -> "AI workflow design".
export function humanizeDimension(key: string | null | undefined): string {
  if (!key) return ''
  const s = key.replace(/_/g, ' ').trim().toLowerCase()
  const sentence = s.charAt(0).toUpperCase() + s.slice(1)
  return sentence.replace(/\bai\b/gi, 'AI')
}
