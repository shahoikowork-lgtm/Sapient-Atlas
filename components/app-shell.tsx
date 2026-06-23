import Link from 'next/link'

const NAV = [
  { href: '/app', label: 'Dashboard' },
  { href: '/app/diagnoses', label: 'Diagnoses' },
  { href: '/app/move', label: 'Current Move' },
  { href: '/app/checkin', label: 'Weekly Check-in' },
  { href: '/app/progress', label: 'Progress' },
  { href: '/app/settings', label: 'Settings' },
] as const

export function AppShell({
  children,
  email,
}: {
  children: React.ReactNode
  email?: string | null
}) {
  return (
    <div className="grid min-h-screen grid-cols-[220px_1fr]">
      <aside className="flex flex-col gap-6 border-r border-black/10 p-4">
        <div className="font-semibold">Sapient Atlas</div>
        <nav className="flex flex-col gap-1 text-sm">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-2 py-1.5 text-black/60 hover:bg-black/5 hover:text-black"
            >
              {label}
            </Link>
          ))}
        </nav>
        {email ? (
          <div className="mt-auto truncate text-xs text-black/40">{email}</div>
        ) : null}
      </aside>
      <main className="p-6">{children}</main>
    </div>
  )
}
