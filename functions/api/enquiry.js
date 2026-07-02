'use strict'

function escapeHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const SUPABASE_URL = 'https://lgqgviyqqubjvuansump.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWd2aXlxcXVianZ1YW5zdW1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc0OTQ2NCwiZXhwIjoyMDk0MzI1NDY0fQ.TKoT1bPae7-dDL6fI2QDpUjc-KSfqGnpniCD93E0it0'
const NOTIFY_EMAIL = 'hello@funeralfair.co.uk'

export async function onRequestPost(context) {
  let body
  try { body = await context.request.json() } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 })
  }

  const { directorId, directorName: rawDirectorName, directorTown: rawDirectorTown,
          enquirerName: rawEnquirerName, enquirerEmail: rawEnquirerEmail,
          enquirerPhone: rawEnquirerPhone, message: rawMessage } = body

  if (!rawEnquirerName || !rawEnquirerEmail || !rawMessage) {
    return new Response(JSON.stringify({ error: 'Name, email and message are required.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  // Look up the director's email from Supabase
  let directorEmail = null
  if (directorId) {
    try {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/funeral_directors?id=eq.${encodeURIComponent(directorId)}&select=email&limit=1`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      )
      const data = await r.json()
      directorEmail = Array.isArray(data) && data[0]?.email ? data[0].email.trim() : null
    } catch {}
  }

  const toDirectly = directorEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(directorEmail)

  // Escaped versions for HTML embedding only — raw values used for email headers/addresses
  const directorName  = escapeHtml(rawDirectorName)
  const directorTown  = escapeHtml(rawDirectorTown)
  const enquirerName  = escapeHtml(rawEnquirerName)
  const enquirerEmail = escapeHtml(rawEnquirerEmail)
  const enquirerPhone = escapeHtml(rawEnquirerPhone)
  const message       = escapeHtml(rawMessage)

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#2d2d2d">
      <div style="background:#7a9e7e;padding:20px 28px;border-radius:12px 12px 0 0">
        <h1 style="margin:0;color:#fff;font-size:18px;font-weight:700">New enquiry via FuneralFair</h1>
      </div>
      <div style="background:#fff;border:1px solid #e8e4df;border-top:none;border-radius:0 0 12px 12px;padding:28px">
        <p style="margin:0 0 20px;font-size:14px;color:#6b6b6b">
          A family has contacted <strong style="color:#2d2d2d">${directorName}</strong>${directorTown ? ` in ${directorTown}` : ''} through FuneralFair. Please reply directly to them.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#6b6b6b;width:110px;vertical-align:top">Name</td><td style="padding:8px 0;font-weight:600">${enquirerName}</td></tr>
          <tr><td style="padding:8px 0;color:#6b6b6b;vertical-align:top">Email</td><td style="padding:8px 0"><a href="mailto:${rawEnquirerEmail}" style="color:#7a9e7e">${enquirerEmail}</a></td></tr>
          ${rawEnquirerPhone ? `<tr><td style="padding:8px 0;color:#6b6b6b;vertical-align:top">Phone</td><td style="padding:8px 0">${enquirerPhone}</td></tr>` : ''}
          <tr><td style="padding:8px 0;color:#6b6b6b;vertical-align:top">Message</td><td style="padding:8px 0;white-space:pre-wrap">${message}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #e8e4df;margin:24px 0">
        <p style="margin:0;font-size:12px;color:#999">
          Reply directly to this email to respond to ${enquirerName}. This enquiry was sent via <a href="https://funeralfair.co.uk" style="color:#7a9e7e">FuneralFair</a>.
        </p>
      </div>
    </div>
  `

  // If no director email, add a note for Adam
  const adminHtml = toDirectly ? html : `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#2d2d2d">
      <div style="background:#e8a838;padding:12px 20px;border-radius:12px 12px 0 0">
        <p style="margin:0;color:#fff;font-size:13px;font-weight:700">⚠ No email on file for ${directorName} — manual forward needed</p>
      </div>
      ${html.replace('<div style="background:#7a9e7e', '<div style="border-radius:0 0 12px 12px;background:#7a9e7e')}
    </div>
  `

  const emailPayload = toDirectly
    ? {
        from: 'FuneralFair <hello@funeralfair.co.uk>',
        to: [directorEmail],
        cc: [NOTIFY_EMAIL],
        reply_to: rawEnquirerEmail,
        subject: `New enquiry from ${rawEnquirerName} — FuneralFair`,
        html,
      }
    : {
        from: 'FuneralFair <hello@funeralfair.co.uk>',
        to: [NOTIFY_EMAIL],
        reply_to: rawEnquirerEmail,
        subject: `[No email on file] Enquiry for ${rawDirectorName} — FuneralFair`,
        html: adminHtml,
      }

  const resendKey = context.env.RESEND_API_KEY

  const sendEmail = payload => fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  // Send enquiry to director (or Adam if no email on file)
  const res = await sendEmail(emailPayload)

  if (!res.ok) {
    const err = await res.json()
    console.error('Resend error:', err)
    return new Response(JSON.stringify({ error: 'Failed to send email.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  // Send confirmation to the family
  const confirmationHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#faf8f6;margin:0;padding:0;">
<div style="max-width:520px;margin:0 auto;padding:40px 20px;">
  <div style="margin-bottom:32px;">
    <a href="https://funeralfair.co.uk" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;">
      <img src="https://funeralfair.co.uk/logo.webp" alt="FuneralFair" width="40" height="40" style="display:block;" />
      <span style="font-size:20px;font-weight:700;letter-spacing:-0.5px;"><span style="color:#2c2c2c;">Funeral</span><span style="color:#7a9e7e;">Fair</span></span>
    </a>
  </div>

  <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#2c2c2c;">Your message has been sent</h1>
  <p style="margin:0 0 24px;font-size:15px;color:#6b6560;line-height:1.6;">
    We've passed your message to <strong style="color:#2c2c2c;">${directorName}</strong>${directorTown ? ` in ${directorTown}` : ''}. They'll be in touch with you directly.
  </p>

  <div style="background:#fff;border:1px solid #e8e2db;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#7a9e7e;text-transform:uppercase;letter-spacing:1px;">Your message</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:6px 12px 6px 0;color:#6b6560;width:80px;vertical-align:top;">To</td><td style="padding:6px 0;font-weight:600;color:#2c2c2c;">${directorName}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#6b6560;vertical-align:top;">From</td><td style="padding:6px 0;color:#2c2c2c;">${enquirerName}</td></tr>
      ${enquirerPhone ? `<tr><td style="padding:6px 12px 6px 0;color:#6b6560;vertical-align:top;">Phone</td><td style="padding:6px 0;color:#2c2c2c;">${enquirerPhone}</td></tr>` : ''}
      <tr><td style="padding:6px 12px 6px 0;color:#6b6560;vertical-align:top;">Message</td><td style="padding:6px 0;color:#2c2c2c;line-height:1.6;white-space:pre-wrap;">${message}</td></tr>
    </table>
  </div>

  <p style="margin:0 0 8px;font-size:14px;color:#6b6560;line-height:1.6;">If you don't hear back within 24 hours, you can contact them directly or <a href="https://funeralfair.co.uk" style="color:#7a9e7e;text-decoration:none;">search for other funeral directors</a> in your area.</p>
  <p style="margin:0 0 32px;font-size:14px;color:#6b6560;">We're sorry for your loss.</p>

  <p style="margin:0;font-size:14px;color:#2c2c2c;font-weight:600;">The FuneralFair team</p>
  <p style="margin:4px 0 0;font-size:13px;color:#9c968f;"><a href="https://funeralfair.co.uk" style="color:#7a9e7e;text-decoration:none;">funeralfair.co.uk</a></p>
</div>
</body></html>`

  // Fire confirmation email + enquiry count increment in background
  context.waitUntil(Promise.all([
    sendEmail({
      from: 'FuneralFair <hello@funeralfair.co.uk>',
      to: [rawEnquirerEmail],
      reply_to: NOTIFY_EMAIL,
      subject: `Your message to ${rawDirectorName} has been sent`,
      html: confirmationHtml,
    }),
    directorId ? fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_enquiry_count`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ director_id: String(directorId) }),
    }) : Promise.resolve(),
    directorId ? fetch(`${SUPABASE_URL}/rest/v1/enquiries`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({
        director_id:    String(directorId),
        enquirer_name:  rawEnquirerName,
        enquirer_email: rawEnquirerEmail,
        enquirer_phone: rawEnquirerPhone || null,
        message:        rawMessage,
      }),
    }) : Promise.resolve(),
  ]))

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
}
