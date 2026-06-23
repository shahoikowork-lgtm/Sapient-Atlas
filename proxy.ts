import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Next.js 16 renamed the `middleware` convention to `proxy`. Same behavior.
// This is the fast redirect gate only; real enforcement is requireUser/requireAdmin
// in the /app and /admin layouts (per the Next 16 proxy docs).

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  // Signed-in users have no reason to see /login → send them to their dashboard.
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  // Protect /app — must be signed in.
  if (pathname.startsWith('/app') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Protect /admin — must be signed in AND on the admin allowlist.
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (!ADMIN_EMAILS.includes((user.email ?? '').toLowerCase())) {
      return NextResponse.redirect(new URL('/app', request.url))
    }
  }

  return response
}

// Run on everything except API routes and static assets. API routes do their own auth.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
