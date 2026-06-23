import { AppNav } from './app-nav'

// The authenticated app runs in the dark "instrument" register so it reads as one product
// with the results page. Desktop: fixed left rail + offset content. Mobile: bottom tab bar
// with content padded to clear it.
export function AppShell({
  children,
  email,
}: {
  children: React.ReactNode
  email?: string | null
}) {
  return (
    <div className="instrument min-h-screen bg-s-bg text-s-text">
      <AppNav email={email} />
      <main className="md:ml-[200px]">
        <div className="mx-auto w-full max-w-3xl px-5 pb-24 pt-8 md:px-8 md:pb-12">{children}</div>
      </main>
    </div>
  )
}
