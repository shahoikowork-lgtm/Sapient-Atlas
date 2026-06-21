import { requireAppUser } from '@/lib/app-user'
import { AppShell } from '@/components/app-shell'

// /app is members-only. requireAppUser gates auth, links the pre-auth workspace row to
// this login on first access, and returns the app user. Middleware (proxy) also guards /app.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAppUser()
  return <AppShell email={user.email}>{children}</AppShell>
}
