'use strict'

const SUPABASE_URL = 'https://lgqgviyqqubjvuansump.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWd2aXlxcXVianZ1YW5zdW1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc0OTQ2NCwiZXhwIjoyMDk0MzI1NDY0fQ.TKoT1bPae7-dDL6fI2QDpUjc-KSfqGnpniCD93E0it0'

async function verifyStripeSignature(body, sigHeader, secret) {
  const parts = Object.fromEntries(
    sigHeader.split(',').map(p => { const [k, v] = p.split('='); return [k, v] })
  )
  const timestamp = parts.t
  const expected  = parts.v1
  if (!timestamp || !expected) return false

  const payload = `${timestamp}.${body}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  const computed = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')

  if (computed.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < computed.length; i++) diff |= computed.charCodeAt(i) ^ expected.charCodeAt(i)
  return diff === 0
}

async function patchByWebsite(website, patch) {
  await fetch(
    `${SUPABASE_URL}/rest/v1/funeral_directors?website=eq.${encodeURIComponent(website)}`,
    {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(patch),
    }
  )
}

async function patchByCustomer(customerId, patch) {
  await fetch(
    `${SUPABASE_URL}/rest/v1/funeral_directors?stripe_customer_id=eq.${encodeURIComponent(customerId)}`,
    {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(patch),
    }
  )
}

async function sendEmail(apiKey, { to, subject, html }) {
  if (!apiKey) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'FuneralFair <hello@funeralfair.co.uk>',
      to,
      subject,
      html,
    }),
  })
}

function welcomeHtml(website, dashboardUrl) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#2d2d2d">
      <div style="background:#7a9e7e;padding:20px 28px;border-radius:12px 12px 0 0">
        <h1 style="margin:0;color:#fff;font-size:18px;font-weight:700">Welcome to FuneralFair Featured</h1>
      </div>
      <div style="background:#fff;border:1px solid #e8e4df;border-top:none;border-radius:0 0 12px 12px;padding:28px">
        <p style="margin:0 0 16px">Your listing for <strong>${website}</strong> is now live as a Featured Partner on FuneralFair.</p>
        <p style="margin:0 0 24px">From your director dashboard you can upload photos to showcase your chapel of rest, staff and premises.</p>
        <div style="text-align:center;margin:0 0 24px">
          <a href="${dashboardUrl}" style="display:inline-block;background:#7a9e7e;color:#fff;padding:13px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px">Open my dashboard</a>
        </div>
        <p style="margin:0;font-size:12px;color:#999">This link is unique to your account — keep it safe. If you ever lose it, email hello@funeralfair.co.uk and we'll resend it.</p>
      </div>
    </div>
  `
}

function underReviewHtml(website) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#2d2d2d">
      <div style="background:#7a9e7e;padding:20px 28px;border-radius:12px 12px 0 0">
        <h1 style="margin:0;color:#fff;font-size:18px;font-weight:700">Your listing is being verified</h1>
      </div>
      <div style="background:#fff;border:1px solid #e8e4df;border-top:none;border-radius:0 0 12px 12px;padding:28px">
        <p style="margin:0 0 16px">Thanks for subscribing to FuneralFair Featured for <strong>${website}</strong>.</p>
        <p style="margin:0 0 16px">We verify all new listings to protect families using our service. Because the email address used at checkout doesn't match your website domain, we'll complete a quick manual check before your listing goes live.</p>
        <p style="margin:0 0 16px">We aim to complete this within 24 hours. We'll email you as soon as it's approved, with a link to your director dashboard.</p>
        <p style="margin:0;font-size:13px;color:#6b6b6b">Any questions? Reply to this email.</p>
      </div>
    </div>
  `
}

function adminAlertHtml(website, directorEmail, name) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#2d2d2d">
      <div style="background:#c97c2e;padding:20px 28px;border-radius:12px 12px 0 0">
        <h1 style="margin:0;color:#fff;font-size:18px;font-weight:700">⚠ Review needed — new Featured listing</h1>
      </div>
      <div style="background:#fff;border:1px solid #e8e4df;border-top:none;border-radius:0 0 12px 12px;padding:28px">
        <p style="margin:0 0 16px">Email domain doesn't match website domain. Manual verification required.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:6px 0;color:#6b6b6b;width:110px">Name</td><td style="padding:6px 0;font-weight:600">${name || '—'}</td></tr>
          <tr><td style="padding:6px 0;color:#6b6b6b">Email</td><td style="padding:6px 0">${directorEmail}</td></tr>
          <tr><td style="padding:6px 0;color:#6b6b6b">Website</td><td style="padding:6px 0">${website}</td></tr>
        </table>
        <p style="margin:24px 0 0;font-size:13px;color:#6b6b6b">Approve or reject from the admin panel at funeralfair.co.uk/admin</p>
      </div>
    </div>
  `
}

export async function onRequestPost(context) {
  const body      = await context.request.text()
  const sigHeader = context.request.headers.get('stripe-signature')
  const secret    = context.env.STRIPE_WEBHOOK_SECRET

  if (!sigHeader || !secret) {
    return new Response('Missing signature', { status: 400 })
  }

  const valid = await verifyStripeSignature(body, sigHeader, secret)
  if (!valid) {
    return new Response('Invalid signature', { status: 400 })
  }

  const event    = JSON.parse(body)
  const resendKey = context.env.RESEND_API_KEY
  const normalise = url => url?.trim().replace(/\/+$/, '')
  const origin   = new URL(context.request.url).origin

  if (event.type === 'checkout.session.completed') {
    const session      = event.data.object
    const website      = normalise(session.metadata?.website)
    const customer     = session.customer
    const needsReview  = session.metadata?.needs_review === 'true'
    const directorEmail = session.customer_details?.email || session.customer_email
    const name         = session.metadata?.name || ''
    const token        = crypto.randomUUID()
    const dashboardUrl = `${origin}/dashboard/${token}`

    if (website) {
      if (needsReview) {
        await patchByWebsite(website, {
          is_featured: false,
          needs_review: true,
          stripe_customer_id: customer,
          claim_token: token,
          email: directorEmail,
        })
        if (directorEmail) {
          await sendEmail(resendKey, {
            to: [directorEmail],
            subject: 'Your FuneralFair featured listing — verification in progress',
            html: underReviewHtml(website),
          })
        }
        await sendEmail(resendKey, {
          to: ['hello@funeralfair.co.uk'],
          subject: `Review needed: new featured listing — ${website}`,
          html: adminAlertHtml(website, directorEmail, name),
        })
      } else {
        await patchByWebsite(website, {
          is_featured: true,
          needs_review: false,
          stripe_customer_id: customer,
          claim_token: token,
          email: directorEmail,
        })
        if (directorEmail) {
          await sendEmail(resendKey, {
            to: [directorEmail],
            subject: 'Welcome to FuneralFair Featured — your listing is live',
            html: welcomeHtml(website, dashboardUrl),
          })
        }
      }
    }
  }

  if (
    event.type === 'customer.subscription.deleted' ||
    event.type === 'invoice.payment_failed'
  ) {
    const obj      = event.data.object
    const customer = obj.customer
    const website  = normalise(obj.metadata?.website)
    if (website) {
      await patchByWebsite(website, { is_featured: false })
    } else if (customer) {
      await patchByCustomer(customer, { is_featured: false })
    }
  }

  return new Response(null, { status: 200 })
}
