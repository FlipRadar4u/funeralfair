const SUPABASE_URL = 'https://lgqgviyqqubjvuansump.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWd2aXlxcXVianZ1YW5zdW1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc0OTQ2NCwiZXhwIjoyMDk0MzI1NDY0fQ.TKoT1bPae7-dDL6fI2QDpUjc-KSfqGnpniCD93E0it0'
const NOTIFY_EMAIL = 'hello@funeralfair.co.uk'

const HEADERS = {
  apikey:         SUPABASE_KEY,
  Authorization:  `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function sanitiseText(val, max = 500) {
  if (val == null) return null
  const s = String(val).trim().replace(/<[^>]*>/g, '').slice(0, max)
  return s || null
}

function sanitiseUrl(val) {
  if (!val) return null
  const s = String(val).trim().slice(0, 300)
  if (!s) return null
  try {
    const url = new URL(s.startsWith('http') ? s : `https://${s}`)
    if (!['http:', 'https:'].includes(url.protocol)) return null
    return url.toString()
  } catch { return null }
}

const VALID_SPECIALISMS = new Set([
  'Natural / green burial','Woodland burial','Repatriation',
  'Jewish funerals','Islamic / Muslim funerals','Hindu funerals','Sikh funerals',
  'Pre-paid funeral plans','Eco-friendly funerals','LGBTQ+ inclusive',
  'Direct cremation','Home funerals','Memorial services',
  'Children & infant funerals','Military funerals',
])

function sanitiseSpecialisms(val) {
  if (!Array.isArray(val)) return null
  const filtered = val.filter(s => VALID_SPECIALISMS.has(s)).slice(0, 15)
  return filtered.length ? filtered : null
}

function sanitiseFaqs(val) {
  if (!Array.isArray(val)) return null
  const faqs = val.slice(0, 6).map(f => ({
    q: String(f.q || '').trim().replace(/<[^>]*>/g, '').slice(0, 200),
    a: String(f.a || '').trim().replace(/<[^>]*>/g, '').slice(0, 500),
  })).filter(f => f.q && f.a)
  return faqs.length ? faqs : null
}

function sanitisePrice(val) {
  if (val == null || val === '') return null
  const n = parseInt(String(val).replace(/[^0-9]/g, ''), 10)
  if (isNaN(n) || n < 100 || n > 50000) return null
  return n
}

function fmt(val, prefix = '') {
  if (val == null) return '—'
  return prefix + val
}

async function sendConfirmation(director, token, brevoKey) {
  if (!director.email) return
  const listingUrl   = `https://funeralfair.co.uk/director/${director.id}`
  const dashboardUrl = `https://funeralfair.co.uk/dashboard/${token}`
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#faf8f6;margin:0;padding:0;">
<div style="max-width:520px;margin:0 auto;padding:40px 20px;">
  <div style="margin-bottom:32px;">
    <a href="https://funeralfair.co.uk" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;">
      <img src="https://funeralfair.co.uk/logo.webp" alt="FuneralFair logo" width="40" height="40" style="display:block;" />
      <span style="font-size:20px;font-weight:700;letter-spacing:-0.5px;"><span style="color:#2c2c2c;">Funeral</span><span style="color:#7a9e7e;">Fair</span></span>
    </a>
  </div>
  <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#2c2c2c;">Thanks for claiming your listing</h1>
  <p style="margin:0 0 24px;font-size:15px;color:#6b6560;line-height:1.6;">Your listing for <strong style="color:#2c2c2c;">${director.name}</strong> is now live on FuneralFair. Families searching in your area will be able to find you and get in touch directly.</p>

  <div style="background:#fff;border:1px solid #e8e2db;border-radius:12px;padding:20px 24px;margin-bottom:16px;">
    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#7a9e7e;text-transform:uppercase;letter-spacing:1px;">Your listing</p>
    <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#2c2c2c;">${director.name}</p>
    <p style="margin:0 0 16px;font-size:14px;color:#6b6560;">${director.town || ''}${director.postcode ? `, ${director.postcode}` : ''}</p>
    <a href="${listingUrl}" style="display:inline-block;background:#7a9e7e;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 20px;border-radius:8px;margin-right:8px;">View your listing →</a>
  </div>

  <div style="background:#fff;border:1px solid #e8e2db;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
    <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#2c2c2c;">Manage your listing anytime</p>
    <p style="margin:0 0 12px;font-size:14px;color:#6b6560;line-height:1.6;">Use your dashboard to update prices, add photos, and manage your listing. Bookmark this link — it's yours to keep.</p>
    <a href="${dashboardUrl}" style="display:inline-block;background:#faf8f6;border:1px solid #e8e2db;color:#2c2c2c;text-decoration:none;font-size:14px;font-weight:600;padding:10px 20px;border-radius:8px;">Open my dashboard →</a>
  </div>

  <div style="background:#f3f7f3;border:1px solid #c5d9c6;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#7a9e7e;text-transform:uppercase;letter-spacing:1px;">Want to stand out?</p>
    <p style="margin:0 0 12px;font-size:15px;font-weight:700;color:#2c2c2c;">Upgrade to Featured — £49/month</p>
    <p style="margin:0 0 14px;font-size:14px;color:#6b6560;line-height:1.6;">Featured listings appear more prominently in search results and give families a much richer view of your business.</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <tr><td style="padding:4px 0;font-size:14px;color:#2c2c2c;">✓&nbsp; Up to 10 photos</td></tr>
      <tr><td style="padding:4px 0;font-size:14px;color:#2c2c2c;">✓&nbsp; Business description</td></tr>
      <tr><td style="padding:4px 0;font-size:14px;color:#2c2c2c;">✓&nbsp; Special offer banner</td></tr>
      <tr><td style="padding:4px 0;font-size:14px;color:#2c2c2c;">✓&nbsp; Opening hours</td></tr>
      <tr><td style="padding:4px 0;font-size:14px;color:#2c2c2c;">✓&nbsp; Facebook &amp; Instagram links</td></tr>
      <tr><td style="padding:4px 0;font-size:14px;color:#2c2c2c;">✓&nbsp; Services &amp; specialisms tags</td></tr>
      <tr><td style="padding:4px 0;font-size:14px;color:#2c2c2c;">✓&nbsp; FAQ section on your listing</td></tr>
    </table>
    <a href="https://funeralfair.co.uk/upgrade/${token}" style="display:inline-block;background:#7a9e7e;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 20px;border-radius:8px;">Upgrade to Featured →</a>
  </div>

  <p style="margin:0 0 8px;font-size:14px;color:#6b6560;line-height:1.6;">If you have any questions, just reply to this email.</p>
  <p style="margin:0 0 32px;font-size:14px;color:#6b6560;">Thanks for being part of FuneralFair.</p>

  <p style="margin:0;font-size:14px;color:#2c2c2c;font-weight:600;">The FuneralFair team</p>
  <p style="margin:4px 0 0;font-size:13px;color:#9c968f;"><a href="https://funeralfair.co.uk" style="color:#7a9e7e;text-decoration:none;">funeralfair.co.uk</a></p>
</div>
</body></html>`

  await fetch('https://api.brevo.com/v3/smtp/email', {
    method:  'POST',
    headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender:      { name: 'FuneralFair', email: NOTIFY_EMAIL },
      to:          [{ email: director.email, name: director.name }],
      replyTo:     { email: NOTIFY_EMAIL, name: 'FuneralFair' },
      subject:     `Thanks for claiming your listing — ${director.name}`,
      htmlContent: html,
    }),
  })
}

async function sendNotification(director, updates, brevoKey) {
  const listingUrl = `https://funeralfair.co.uk/director/${director.id}`
  const rows = [
    ['Attended funeral price', updates.attended_price != null ? `£${updates.attended_price}` : null],
    ['Direct cremation price', updates.cremation_price != null ? `£${updates.cremation_price}` : null],
    ['Phone',   updates.phone],
    ['Website', updates.website],
    ['Address', updates.address],
  ].filter(([, v]) => v != null)

  const changesHtml = rows.length
    ? rows.map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#6b6560;font-size:14px;">${k}</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#2c2c2c;">${v}</td></tr>`).join('')
    : '<tr><td colspan="2" style="padding:6px 0;font-size:14px;color:#6b6560;">No changes submitted</td></tr>'

  const html = `<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#faf8f6;margin:0;padding:0;">
<div style="max-width:480px;margin:0 auto;padding:32px 20px;">
  <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#7a9e7e;text-transform:uppercase;letter-spacing:1.5px;">FuneralFair</p>
  <h1 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#2c2c2c;">Listing claimed ✓</h1>
  <div style="background:#fff;border:1px solid #e8e2db;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
    <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#2c2c2c;">${director.name}</p>
    <p style="margin:0 0 16px;font-size:14px;color:#6b6560;">${director.town || ''}${director.postcode ? `, ${director.postcode}` : ''}</p>
    <table style="width:100%;border-top:1px solid #e8e2db;padding-top:12px;">${changesHtml}</table>
  </div>
  <a href="${listingUrl}" style="display:inline-block;background:#7a9e7e;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 20px;border-radius:8px;">View listing →</a>
  <p style="margin:20px 0 0;font-size:12px;color:#9c968f;">${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}</p>
</div>
</body></html>`

  await fetch('https://api.brevo.com/v3/smtp/email', {
    method:  'POST',
    headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender:      { name: 'FuneralFair', email: NOTIFY_EMAIL },
      to:          [{ email: 'adamjones2005@icloud.com', name: 'Adam' }],
      subject:     `🎉 ${director.name} just claimed their listing`,
      htmlContent: html,
    }),
  })
}

async function sendPriceAlert(director, oldA, oldC, newA, newC, brevoKey) {
  const fmtP = v => v != null ? `£${v}` : '—'
  const rows = []
  if (newA !== undefined && newA !== oldA) rows.push(['Attended funeral', fmtP(oldA), fmtP(newA)])
  if (newC !== undefined && newC !== oldC) rows.push(['Direct cremation', fmtP(oldC), fmtP(newC)])
  if (!rows.length) return

  const rowsHtml = rows.map(([label, before, after]) =>
    `<tr>
      <td style="padding:8px 12px 8px 0;font-size:14px;color:#6b6560;">${label}</td>
      <td style="padding:8px 8px 8px 0;font-size:14px;color:#9c968f;text-decoration:line-through;">${before}</td>
      <td style="padding:8px 0;font-size:14px;font-weight:700;color:#2c2c2c;">${after}</td>
    </tr>`
  ).join('')

  const listingUrl = `https://funeralfair.co.uk/director/${director.id}`
  const html = `<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#faf8f6;margin:0;padding:0;">
<div style="max-width:480px;margin:0 auto;padding:32px 20px;">
  <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#7a9e7e;text-transform:uppercase;letter-spacing:1.5px;">FuneralFair</p>
  <h1 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#2c2c2c;">Price update — ${director.name}</h1>
  <div style="background:#fff;border:1px solid #e8e2db;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
    <p style="margin:0 0 16px;font-size:14px;color:#6b6560;">${director.town || ''}${director.postcode ? `, ${director.postcode}` : ''}</p>
    <table style="width:100%;border-top:1px solid #e8e2db;padding-top:12px;border-collapse:collapse;">
      <tr>
        <th style="padding:6px 12px 6px 0;font-size:12px;color:#9c968f;text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Service</th>
        <th style="padding:6px 8px 6px 0;font-size:12px;color:#9c968f;text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Before</th>
        <th style="padding:6px 0;font-size:12px;color:#9c968f;text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">After</th>
      </tr>
      ${rowsHtml}
    </table>
  </div>
  <a href="${listingUrl}" style="display:inline-block;background:#7a9e7e;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 20px;border-radius:8px;">View listing →</a>
  <p style="margin:20px 0 0;font-size:12px;color:#9c968f;">${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}</p>
</div>
</body></html>`

  await fetch('https://api.brevo.com/v3/smtp/email', {
    method:  'POST',
    headers: { 'api-key': brevoKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender:      { name: 'FuneralFair', email: NOTIFY_EMAIL },
      to:          [{ email: 'adamjones2005@icloud.com', name: 'Adam' }],
      subject:     `Price update — ${director.name}`,
      htmlContent: html,
    }),
  })
}

// GET /api/claim/:token — return director data for this token
export async function onRequestGet(context) {
  const { token } = context.params
  if (!token || token.length < 10) return json({ error: 'Invalid token' }, 400)

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/funeral_directors?claim_token=eq.${encodeURIComponent(token)}&select=id,name,town,postcode,address,phone,website,attended_price,cremation_price,claimed_at,is_featured,photos,pending_photos,email,description,opening_hours,facebook_url,instagram_url,special_offer,specialisms,faqs,view_count,enquiry_count&limit=1`,
    { headers: HEADERS }
  )
  const data = await res.json()
  const director = Array.isArray(data) ? data[0] ?? null : null

  if (!director) return json({ error: 'Not found' }, 404)
  return json(director)
}

// POST /api/claim/:token — update director's listing
export async function onRequestPost(context) {
  const { token } = context.params
  if (!token || token.length < 10) return json({ error: 'Invalid token' }, 400)

  // Fetch director to verify token and get name/town for notification
  const check = await fetch(
    `${SUPABASE_URL}/rest/v1/funeral_directors?claim_token=eq.${encodeURIComponent(token)}&select=id,name,town,postcode,email,is_featured,claimed_at,attended_price,cremation_price&limit=1`,
    { headers: HEADERS }
  )
  const checkData = await check.json()
  if (!Array.isArray(checkData) || !checkData[0]) return json({ error: 'Invalid token' }, 404)
  const director = checkData[0]
  const isFirstClaim = !director.claimed_at

  let body
  try { body = await context.request.json() }
  catch { return json({ error: 'Invalid request body' }, 400) }

  // Only allow specific fields — sanitise everything
  const updates = {
    attended_price:  sanitisePrice(body.attended_price),
    cremation_price: sanitisePrice(body.cremation_price),
    phone:           sanitiseText(body.phone),
    website:         sanitiseText(body.website),
    address:         sanitiseText(body.address),
    // Description available to all directors — featured get 800 chars, standard get 300
    description:     sanitiseText(body.description, director.is_featured ? 800 : 300),
    // Only stamp claimed_at on first claim — subsequent dashboard saves leave it unchanged
    ...(isFirstClaim ? { claimed_at: new Date().toISOString() } : {}),
  }

  // Featured-only fields — only save if director is on paid tier
  const featuredFields = {}
  if (director.is_featured) {
    featuredFields.opening_hours = sanitiseText(body.opening_hours, 300)
    featuredFields.facebook_url  = sanitiseUrl(body.facebook_url)
    featuredFields.instagram_url = sanitiseUrl(body.instagram_url)
    featuredFields.special_offer = sanitiseText(body.special_offer, 200)
    featuredFields.specialisms   = sanitiseSpecialisms(body.specialisms)
    featuredFields.faqs          = sanitiseFaqs(body.faqs)
    Object.assign(updates, featuredFields)
  }

  // Remove nulls from base fields so we don't overwrite existing data
  // Exceptions: claimed_at, description (so directors can clear it), and featured fields (always persisted)
  const featuredKeys = new Set(Object.keys(featuredFields))
  for (const key of Object.keys(updates)) {
    if (updates[key] === null && key !== 'claimed_at' && key !== 'description' && !featuredKeys.has(key)) delete updates[key]
  }

  // A price the director entered themselves is the most authoritative source we
  // have, so flag it as checked. Without this it is indistinguishable from a
  // chain bulk fill and gets caught by data-cleanup scripts — see the 851-row
  // duplicate-price cleanup on 2026-07-22, which had to exclude claimed rows by hand.
  if ('attended_price' in updates || 'cremation_price' in updates) {
    updates.manually_checked = true
  }

  const updateRes = await fetch(
    `${SUPABASE_URL}/rest/v1/funeral_directors?claim_token=eq.${encodeURIComponent(token)}`,
    {
      method:  'PATCH',
      headers: { ...HEADERS, Prefer: 'return=representation' },
      body:    JSON.stringify(updates),
    }
  )

  const result = await updateRes.json()
  if (!updateRes.ok) return json({ error: 'Update failed' }, 500)

  const brevoKey = context.env.BREVO_API_KEY
  const emailTasks = []

  if (isFirstClaim) {
    emailTasks.push(sendNotification(director, updates, brevoKey))
    emailTasks.push(sendConfirmation(director, token, brevoKey))
  }

  // Alert Adam when a price changes on subsequent dashboard saves only —
  // first claim already shows prices in the notification email above
  const priceChanged = !isFirstClaim && (
    ('attended_price'  in updates && updates.attended_price  !== director.attended_price) ||
    ('cremation_price' in updates && updates.cremation_price !== director.cremation_price)
  )
  if (priceChanged) {
    emailTasks.push(sendPriceAlert(
      director,
      director.attended_price,  director.cremation_price,
      updates.attended_price,   updates.cremation_price,
      brevoKey,
    ))
  }

  if (emailTasks.length) context.waitUntil(Promise.all(emailTasks))

  const updated = Array.isArray(result) ? result[0] ?? null : null
  return json(updated ?? { success: true })
}
