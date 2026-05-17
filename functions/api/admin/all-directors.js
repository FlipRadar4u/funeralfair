'use strict'

const SUPABASE_URL = 'https://lgqgviyqqubjvuansump.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWd2aXlxcXVianZ1YW5zdW1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc0OTQ2NCwiZXhwIjoyMDk0MzI1NDY0fQ.TKoT1bPae7-dDL6fI2QDpUjc-KSfqGnpniCD93E0it0'

export async function onRequestGet(context) {
  const pw = new URL(context.request.url).searchParams.get('pw')
  if (!pw || pw !== context.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/funeral_directors?select=id,name,town,postcode,phone,website,address,attended_price,cremation_price,nafd_member,saif_member,is_featured,verified,needs_review,last_updated,email,claimed_at,claim_email_sent_at,google_rating,google_reviews&order=name.asc&limit=50000`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  )
  const body = await res.text()
  return new Response(body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  })
}
