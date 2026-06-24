'use strict'

const SUPABASE_URL  = 'https://lgqgviyqqubjvuansump.supabase.co'
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWd2aXlxcXVianZ1YW5zdW1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc0OTQ2NCwiZXhwIjoyMDk0MzI1NDY0fQ.TKoT1bPae7-dDL6fI2QDpUjc-KSfqGnpniCD93E0it0'
const NOTIFY_EMAIL  = 'hello@funeralfair.co.uk'
const SB_HEADERS    = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' }

function ok(data = {})  { return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } }) }
function err(msg, status = 400) { return new Response(JSON.stringify({ error: msg }), { status, headers: { 'Content-Type': 'application/json' } }) }

async function sendLink(director, brevoKey) {
  const dashboardUrl = `https://funeralfair.co.uk/dashboard/${director.claim_token}`
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#faf8f6;margin:0;padding:0;">
<div style="max-width:520px;margin:0 auto;padding:40px 20px;">
  <div style="margin-bottom:32px;">
    <a href="https://funeralfair.co.uk" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;">
      <img src="https://funeralfair.co.uk/logo.png" alt="FuneralFair" width="40" height="40" style="display:block;" />
      <span style="font-size:20px;font-weight:700;letter-spacing:-0.5px;"><span style="color:#2c2c2c;">Funeral</span><span style="color:#7a9e7e;">Fair</span></span>
    </a>
  </div>

  <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#2c2c2c;">Your dashboard link</h1>
  <p style="margin:0 0 24px;font-size:15px;color:#6b6560;line-height:1.6;">
    Here's your link to manage your FuneralFair listing for <strong style="color:#2c2c2c;">${director.name}</strong>.
  </p>

  <div style="background:#fff;border:1px solid #e8e2db;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#7a9e7e;text-transform:uppercase;letter-spacing:1px;">Your listing</p>
    <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#2c2c2c;">${director.name}</p>
    <p style="margin:0 0 16px;font-size:14px;color:#6b6560;">${director.town || ''}${director.postcode ? `, ${director.postcode}` : ''}</p>
    <a href="${dashboardUrl}" style="display:inline-block;background:#7a9e7e;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;">Open my dashboard →</a>
  </div>

  <p style="margin:0 0 8px;font-size:14px;color:#6b6560;line-height:1.6;">
    Bookmark this link so you can return to your dashboard anytime. If you didn't request this email, you can safely ignore it.
  </p>

  <p style="margin:24px 0 0;font-size:14px;color:#2c2c2c;font-weight:600;">The FuneralFair team</p>
  <p style="margin:4px 0 0;font-size:13px;color:#9c968f;"><a href="https://funeralfair.co.uk" style="color:#7a9e7e;text-decoration:none;">funeralfair.co.uk</a></p>
</div>
</body></html>`

  await fetch('https://api.brevo.com/v3/smtp/email', {
    method:  'POST',
    headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender:      { name: 'FuneralFair', email: NOTIFY_EMAIL },
      to:          [{ email: director.email, name: director.name }],
      subject:     'Your FuneralFair dashboard link',
      htmlContent: html,
    }),
  })
}

// Simple in-memory rate limit: max 3 requests per IP per 10 minutes
const rateLimitMap = new Map()
function isRateLimited(ip) {
  const now = Date.now()
  const window = 10 * 60 * 1000
  const entry = rateLimitMap.get(ip) || { count: 0, reset: now + window }
  if (now > entry.reset) { rateLimitMap.set(ip, { count: 1, reset: now + window }); return false }
  if (entry.count >= 3) return true
  rateLimitMap.set(ip, { ...entry, count: entry.count + 1 })
  return false
}

export async function onRequestPost(context) {
  const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown'
  if (isRateLimited(ip)) {
    return ok({ sent: false }) // silently drop — don't reveal rate limiting
  }

  let body
  try { body = await context.request.json() } catch { return err('Invalid request') }

  const email = String(body.email || '').trim().toLowerCase()
  if (!email || !email.includes('@')) return err('Please enter a valid email address.')

  // Look up directors with this email that have a claim_token
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/funeral_directors?email=eq.${encodeURIComponent(email)}&claim_token=not.is.null&select=id,name,town,postcode,email,claim_token`,
    { headers: SB_HEADERS }
  )
  const directors = await res.json()

  // Always return 200 — never reveal whether the email exists
  if (!Array.isArray(directors) || !directors.length) return ok({ sent: false })

  const brevoKey = context.env.BREVO_API_KEY

  // If multiple listings share the same email, send one email per listing
  context.waitUntil(
    Promise.all(directors.map(d => sendLink(d, brevoKey)))
  )

  return ok({ sent: true })
}
