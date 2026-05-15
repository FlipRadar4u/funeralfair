'use strict'

const PRICE_ID = 'price_1TX2pl3qcs7LhgQTctPXaEGK'

function domainsMatch(email, website) {
  try {
    const emailDomain = email.split('@')[1]?.toLowerCase().replace(/^www\./, '')
    const websiteDomain = new URL(
      website.startsWith('http') ? website : `https://${website}`
    ).hostname.replace(/^www\./, '').toLowerCase()
    return emailDomain === websiteDomain
  } catch {
    return false
  }
}

export async function onRequestPost(context) {
  const { name, email, website } = await context.request.json()

  const cleanWebsite = website.trim().replace(/\/+$/, '')
  if (!email || !cleanWebsite) {
    return new Response(JSON.stringify({ error: 'Email and website are required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const needsReview = !domainsMatch(email, cleanWebsite)
  const origin = new URL(context.request.url).origin

  const params = new URLSearchParams({
    mode: 'subscription',
    'line_items[0][price]': PRICE_ID,
    'line_items[0][quantity]': '1',
    customer_email: email,
    success_url: `${origin}/featured-confirmed?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/for-funeral-directors`,
    'metadata[name]': name || '',
    'metadata[website]': cleanWebsite,
    'metadata[needs_review]': needsReview ? 'true' : 'false',
    'subscription_data[metadata][website]': cleanWebsite,
  })

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${context.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  const session = await res.json()

  if (!res.ok) {
    return new Response(JSON.stringify({ error: session.error?.message || 'Stripe error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ url: session.url }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
