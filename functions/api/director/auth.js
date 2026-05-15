'use strict'

const SUPABASE_URL = 'https://lgqgviyqqubjvuansump.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWd2aXlxcXVianZ1YW5zdW1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc0OTQ2NCwiZXhwIjoyMDk0MzI1NDY0fQ.TKoT1bPae7-dDL6fI2QDpUjc-KSfqGnpniCD93E0it0'

export async function onRequestGet(context) {
  const token = new URL(context.request.url).searchParams.get('token')
  if (!token) {
    return new Response(JSON.stringify({ error: 'No token' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/funeral_directors?director_token=eq.${encodeURIComponent(token)}&select=id,name,town,postcode,website,photos,pending_photos,is_featured,needs_review,director_email`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  )
  const rows = await res.json()
  if (!rows.length) {
    return new Response(JSON.stringify({ error: 'Invalid or expired link' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify(rows[0]), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
}
