export function money(n: number | null | undefined, currency = 'USD') {
  if (n == null) return '-'
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
  } catch {
    return `$${Math.round(n).toLocaleString('en-US')}`
  }
}
