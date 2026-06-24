const SUPABASE_URL = 'https://lgqgviyqqubjvuansump.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWd2aXlxcXVianZ1YW5zdW1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc0OTQ2NCwiZXhwIjoyMDk0MzI1NDY0fQ.TKoT1bPae7-dDL6fI2QDpUjc-KSfqGnpniCD93E0it0'
const SB           = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' }
const SITE_URL     = 'https://funeralfair.co.uk'

function stripUrl(url) {
  if (!url) return ''
  return url.toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').trim()
}

async function findDirector(website, businessName, postcode) {
  // 1. Match by website domain (most reliable)
  if (website) {
    const domain = stripUrl(website).split('/')[0] // just 'mysite.co.uk'
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/funeral_directors?select=id,name,town,postcode,email,claim_token&website=ilike.*${encodeURIComponent(domain)}*&limit=1`,
      { headers: SB }
    )
    const rows = await res.json()
    if (Array.isArray(rows) && rows.length) return rows[0]
  }

  // 2. Fallback: match by name + postcode
  if (businessName && postcode) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/funeral_directors?select=id,name,town,postcode,email,claim_token&name=ilike.*${encodeURIComponent(businessName)}*&postcode=ilike.${encodeURIComponent(postcode.trim())}*&limit=1`,
      { headers: SB }
    )
    const rows = await res.json()
    if (Array.isArray(rows) && rows.length) return rows[0]
  }

  return null
}

async function ensureClaimToken(director) {
  if (director.claim_token) return director.claim_token
  const token = crypto.randomUUID()
  await fetch(
    `${SUPABASE_URL}/rest/v1/funeral_directors?id=eq.${director.id}`,
    { method: 'PATCH', headers: { ...SB, Prefer: 'return=minimal' }, body: JSON.stringify({ claim_token: token }) }
  )
  return token
}

async function sendApprovalEmail(director, brevoKey) {
  const dashboardUrl = `${SITE_URL}/dashboard/${director.claim_token}`
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf8f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:540px;margin:0 auto;padding:40px 20px;">

  <div style="margin-bottom:32px;">
    <a href="${SITE_URL}" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;">
      <img src="${SITE_URL}/logo.png" alt="FuneralFair" width="40" height="40" style="display:block;" />
      <span style="font-size:20px;font-weight:700;letter-spacing:-0.5px;"><span style="color:#2c2c2c;">Funeral</span><span style="color:#7a9e7e;">Fair</span></span>
    </a>
  </div>

  <div style="background:#fff;border:1px solid #e8e2db;border-radius:16px;padding:36px;">
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#2c2c2c;line-height:1.3;">
      Your listing has been approved
    </h1>
    <p style="margin:0 0 16px;font-size:15px;color:#6b6560;line-height:1.6;">
      Thank you for applying to FuneralFair. Your listing for <strong style="color:#2c2c2c;">${director.name}</strong> is now live and families in your area can find you.
    </p>
    <p style="margin:0 0 28px;font-size:15px;color:#6b6560;line-height:1.6;">
      Use your dashboard to keep your prices, contact details, and photos up to date.
    </p>
    <div style="text-align:center;margin-bottom:20px;">
      <a href="${dashboardUrl}"
         style="display:inline-block;background:#7a9e7e;color:#fff;text-decoration:none;font-size:16px;font-weight:700;padding:15px 36px;border-radius:10px;letter-spacing:-0.2px;">
        Go to my dashboard &rarr;
      </a>
    </div>
    <p style="margin:0;font-size:13px;color:#9c968f;text-align:center;">
      Bookmark this link — it&rsquo;s your permanent access to your listing.
    </p>
  </div>

  <div style="margin-top:28px;padding-top:24px;border-top:1px solid #e8e2db;">
    <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#2c2c2c;">Adam Jones</p>
    <p style="margin:0;font-size:13px;color:#7a9e7e;">Founder, FuneralFair</p>
  </div>

</div>
</body></html>`

  return fetch('https://api.brevo.com/v3/smtp/email', {
    method:  'POST',
    headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender:      { name: 'FuneralFair', email: 'hello@funeralfair.co.uk' },
      to:          [{ email: director.email, name: director.name }],
      subject:     'Your FuneralFair listing has been approved',
      htmlContent: html,
    }),
  })
}

async function deleteApplication(id) {
  return fetch(
    `${SUPABASE_URL}/rest/v1/listing_applications?id=eq.${id}`,
    { method: 'DELETE', headers: { ...SB, Prefer: 'return=minimal' } }
  )
}

export async function onRequestPost(context) {
  try {
    const { pw, id, website, business_name, postcode, email: appEmail } = await context.request.json()

    if (!pw || pw !== context.env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    }

    // Find the matching director in the DB
    let director = await findDirector(website, business_name, postcode)

    if (!director) {
      return new Response(JSON.stringify({ ok: false, reason: 'no_match' }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      })
    }

    // Use email from application if director record has none
    if (!director.email && appEmail) {
      await fetch(
        `${SUPABASE_URL}/rest/v1/funeral_directors?id=eq.${director.id}`,
        { method: 'PATCH', headers: { ...SB, Prefer: 'return=minimal' }, body: JSON.stringify({ email: appEmail }) }
      )
      director.email = appEmail
    }

    if (!director.email) {
      return new Response(JSON.stringify({ ok: false, reason: 'no_email' }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      })
    }

    // Ensure a claim token exists
    director.claim_token = await ensureClaimToken(director)

    // Send approval email + delete application
    const brevoKey = context.env.BREVO_API_KEY
    await Promise.all([
      sendApprovalEmail(director, brevoKey),
      deleteApplication(id),
    ])

    return new Response(JSON.stringify({ ok: true, directorId: director.id, directorName: director.name }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
