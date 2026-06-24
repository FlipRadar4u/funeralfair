const SUPABASE_URL  = 'https://lgqgviyqqubjvuansump.supabase.co'
const ANON_KEY      = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWd2aXlxcXVianZ1YW5zdW1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NDk0NjQsImV4cCI6MjA5NDMyNTQ2NH0.BvIyZUKeCjPhqqM9oJRM5NU6nRJYZrZLBBX4X6eXdCg'
const SERVICE_KEY   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWd2aXlxcXVianZ1YW5zdW1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc0OTQ2NCwiZXhwIjoyMDk0MzI1NDY0fQ.TKoT1bPae7-dDL6fI2QDpUjc-KSfqGnpniCD93E0it0'

export async function onRequestGet(context) {
  const { id } = context.params

  const [dirRes, revRes] = await Promise.all([
    fetch(
      `${SUPABASE_URL}/rest/v1/funeral_directors?id=eq.${id}&select=id,name,town,postcode,address,phone,website,lat,lng,attended_price,cremation_price,nafd_member,saif_member,is_featured,verified,last_updated,google_rating,google_reviews,photos,email,claimed_at,description,opening_hours,facebook_url,instagram_url,special_offer,specialisms,faqs`,
      { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } }
    ),
    fetch(
      `${SUPABASE_URL}/rest/v1/reviews?director_id=eq.${id}&approved=eq.true&select=id,reviewer_name,rating,body,created_at&order=created_at.desc&limit=50`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
    ),
  ])

  const data = await dirRes.json()
  const raw = Array.isArray(data) ? data[0] ?? null : null
  if (!raw) {
    return new Response(JSON.stringify(null), { status: 404, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
  }

  const reviews = revRes.ok ? (await revRes.json().catch(() => [])) : []

  const { email, ...director } = raw
  director.has_email = !!(email && email.trim())
  director.reviews   = Array.isArray(reviews) ? reviews : []

  // Increment view count in background — don't block the response
  context.waitUntil(
    fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_view_count`, {
      method: 'POST',
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ director_id: raw.id }),
    })
  )

  return new Response(JSON.stringify(director), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}
