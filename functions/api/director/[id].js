const SUPABASE_URL = 'https://lgqgviyqqubjvuansump.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWd2aXlxcXVianZ1YW5zdW1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NDk0NjQsImV4cCI6MjA5NDMyNTQ2NH0.BvIyZUKeCjPhqqM9oJRM5NU6nRJYZrZLBBX4X6eXdCg'

export async function onRequestGet(context) {
  const { id } = context.params
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/funeral_directors?id=eq.${id}&select=id,name,town,postcode,address,phone,website,attended_price,cremation_price,nafd_member,saif_member,is_featured,verified,last_updated,google_rating,google_reviews,photos,email,claimed_at`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  )
  const data = await res.json()
  const raw = Array.isArray(data) ? data[0] ?? null : null
  if (!raw) {
    return new Response(JSON.stringify(null), { status: 404, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
  }

  // Expose whether an email exists without exposing the address itself
  const { email, ...director } = raw
  director.has_email = !!(email && email.trim())

  return new Response(JSON.stringify(director), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}
