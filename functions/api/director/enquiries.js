'use strict'

const SUPABASE_URL = 'https://lgqgviyqqubjvuansump.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWd2aXlxcXVianZ1YW5zdW1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc0OTQ2NCwiZXhwIjoyMDk0MzI1NDY0fQ.TKoT1bPae7-dDL6fI2QDpUjc-KSfqGnpniCD93E0it0'

export async function onRequestGet(context) {
  const token = new URL(context.request.url).searchParams.get('token')
  if (!token) {
    return new Response(JSON.stringify({ error: 'Token required' }), { status: 400 })
  }

  // Verify token — try claim_token then legacy director_token
  let director = null
  for (const field of ['claim_token', 'director_token']) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/funeral_directors?${field}=eq.${encodeURIComponent(token)}&select=id`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    const rows = await res.json()
    if (Array.isArray(rows) && rows.length) { director = rows[0]; break }
  }

  if (!director) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 })
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/enquiries?director_id=eq.${director.id}&select=id,enquirer_name,enquirer_email,enquirer_phone,message,created_at&order=created_at.desc&limit=50`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  )

  if (!res.ok) {
    return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  const data = await res.json()
  return new Response(JSON.stringify(Array.isArray(data) ? data : []), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
}
