// SERVER ONLY. Transactional email transport.
//
// Uses the Resend HTTP API (a single fetch, no SDK dependency) when RESEND_API_KEY
// is set. When it is not, it logs the email and returns ok (a stub) so the calling
// flow never breaks in dev or when keys are missing. This module NEVER throws and
// NEVER sends AI-generated content, it only sends transactional notifications.

type SendArgs = { to: string; subject: string; html: string; text: string }
export type SendResult = { ok: boolean; id?: string; skipped?: boolean; error?: string }

const DEFAULT_FROM = 'Sapient Atlas <onboarding@resend.dev>'

export async function sendEmail(args: SendArgs): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM || DEFAULT_FROM

  // Stub fallback: no provider configured. Log enough to confirm the flow fired.
  if (!apiKey) {
    console.log(
      `[email:stub] would send to=${args.to} subject="${args.subject}" (RESEND_API_KEY unset, not sent)`,
    )
    return { ok: true, skipped: true }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: args.to,
        subject: args.subject,
        html: args.html,
        text: args.text,
      }),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error(`[email] send failed ${res.status}: ${detail}`)
      return { ok: false, error: `status ${res.status}` }
    }
    const data = (await res.json().catch(() => ({}))) as { id?: string }
    return { ok: true, id: data.id }
  } catch (err) {
    console.error('[email] send error:', err instanceof Error ? err.message : err)
    return { ok: false, error: 'exception' }
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Diagnosis-ready notification. Transactional ONLY: a generic message plus the
// private results link. Deliberately contains NO assessment numbers, observation,
// or move content (guardrail: AI output is never auto-sent to the user). Sent only
// after a human approves the diagnosis in the admin queue.
export async function sendDiagnosisReadyEmail(opts: {
  to: string
  name?: string | null
  resultsUrl: string
}): Promise<SendResult> {
  const name = (opts.name ?? '').trim() || 'there'
  const subject = 'Your Sapient Atlas diagnosis is ready'

  const text = [
    `Hi ${name},`,
    '',
    'Your Sapient Atlas diagnosis has been reviewed and is ready to view:',
    opts.resultsUrl,
    '',
    'Keep this link, it is private to you.',
    '',
    'The Sapient Atlas team',
  ].join('\n')

  const safeName = escapeHtml(name)
  const safeUrl = escapeHtml(opts.resultsUrl)
  const html = [
    `<p>Hi ${safeName},</p>`,
    '<p>Your Sapient Atlas diagnosis has been reviewed and is ready to view.</p>',
    `<p><a href="${safeUrl}">View your diagnosis</a></p>`,
    '<p style="color:#666;font-size:13px">Keep this link, it is private to you.</p>',
    '<p style="color:#666;font-size:13px">The Sapient Atlas team</p>',
  ].join('')

  return sendEmail({ to: opts.to, subject, html, text })
}
