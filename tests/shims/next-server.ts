// Minimal stand-in for `next/server` so route handlers can be imported and called
// directly in tests without pulling in Next's server runtime. Only NextResponse.json
// is used by the routes under test; it returns a standard web Response.
export class NextResponse {
  static json(body: unknown, init?: { status?: number }): Response {
    return new Response(JSON.stringify(body), {
      status: init?.status ?? 200,
      headers: { 'content-type': 'application/json' },
    })
  }
}
