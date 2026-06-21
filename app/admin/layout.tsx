import { requireAdmin } from '@/lib/auth'

// /admin is allowlist-only (ADMIN_EMAILS). Middleware guards it; this re-checks server-side.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()
  return (
    <div className="min-h-screen">
      <header className="border-b border-black/10 px-6 py-4 text-sm font-medium">
        Sapient Atlas · Admin
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
