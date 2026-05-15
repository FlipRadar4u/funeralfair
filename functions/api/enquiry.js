'use strict'

export async function onRequestPost(context) {
  const { directorName, directorTown, enquirerName, enquirerEmail, enquirerPhone, message } = await context.request.json()

  if (!enquirerName || !enquirerEmail || !message) {
    return new Response(JSON.stringify({ error: 'Name, email and message are required.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#2d2d2d">
      <div style="background:#7a9e7e;padding:20px 28px;border-radius:12px 12px 0 0">
        <h1 style="margin:0;color:#fff;font-size:18px;font-weight:700">New enquiry via FuneralFair</h1>
      </div>
      <div style="background:#fff;border:1px solid #e8e4df;border-top:none;border-radius:0 0 12px 12px;padding:28px">
        <p style="margin:0 0 20px;font-size:14px;color:#6b6b6b">
          A family has submitted an enquiry for <strong style="color:#2d2d2d">${directorName}</strong>${directorTown ? ` in ${directorTown}` : ''}.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#6b6b6b;width:110px;vertical-align:top">Name</td><td style="padding:8px 0;font-weight:600">${enquirerName}</td></tr>
          <tr><td style="padding:8px 0;color:#6b6b6b;vertical-align:top">Email</td><td style="padding:8px 0"><a href="mailto:${enquirerEmail}" style="color:#7a9e7e">${enquirerEmail}</a></td></tr>
          ${enquirerPhone ? `<tr><td style="padding:8px 0;color:#6b6b6b;vertical-align:top">Phone</td><td style="padding:8px 0">${enquirerPhone}</td></tr>` : ''}
          <tr><td style="padding:8px 0;color:#6b6b6b;vertical-align:top">Message</td><td style="padding:8px 0;white-space:pre-wrap">${message}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #e8e4df;margin:24px 0">
        <p style="margin:0;font-size:12px;color:#999">Reply directly to this email to respond to ${enquirerName}.</p>
      </div>
    </div>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${context.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'FuneralFair <hello@funeralfair.co.uk>',
      to: ['hello@funeralfair.co.uk'],
      reply_to: enquirerEmail,
      subject: `New enquiry for ${directorName} — FuneralFair`,
      html,
    }),
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
