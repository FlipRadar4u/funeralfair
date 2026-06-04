'use strict'

const SUPABASE_URL = 'https://lgqgviyqqubjvuansump.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWd2aXlxcXVianZ1YW5zdW1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc0OTQ2NCwiZXhwIjoyMDk0MzI1NDY0fQ.TKoT1bPae7-dDL6fI2QDpUjc-KSfqGnpniCD93E0it0'
const NOTIFY_EMAIL = 'hello@funeralfair.co.uk'

export async function onRequestPost(context) {
  let body
  try { body = await context.request.json() } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 })
  }

  const { directorId, directorName, directorTown, enquirerName, enquirerEmail, enquirerPhone, message } = body

  if (!enquirerName || !enquirerEmail || !message) {
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
          <tr><td style="padding:8px 0;color:#6b6b6b;vertical-align:top">Email</td><td style="padding:8px 0"><a href="mailto:${enquirerEmail}" style="color:#7a9e7e">${enquirerEmail}</a></td></tr>
          ${enquirerPhone ? `<tr><td style="padding:8px 0;color:#6b6b6b;vertical-align:top">Phone</td><td style="padding:8px 0">${enquirerPhone}</td></tr>` : ''}
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
        reply_to: enquirerEmail,
        subject: `New enquiry from ${enquirerName} — FuneralFair`,
        html,
      }
    : {
        from: 'FuneralFair <hello@funeralfair.co.uk>',
        to: [NOTIFY_EMAIL],
        reply_to: enquirerEmail,
        subject: `[No email on file] Enquiry for ${directorName} — FuneralFair`,
        html: adminHtml,
      }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${context.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailPayload),
  })

  if (!res.ok) {
    const err = await res.json()
    console.error('Resend error:', err)
    return new Response(JSON.stringify({ error: 'Failed to send email.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
}
