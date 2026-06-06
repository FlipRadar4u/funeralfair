'use strict'

const SUPABASE_URL = 'https://lgqgviyqqubjvuansump.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWd2aXlxcXVianZ1YW5zdW1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc0OTQ2NCwiZXhwIjoyMDk0MzI1NDY0fQ.TKoT1bPae7-dDL6fI2QDpUjc-KSfqGnpniCD93E0it0'

export async function onRequestPost(context) {
  let body
  try { body = await context.request.json() } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 })
  }

  const { token, photos } = body
  if (!token || !Array.isArray(photos)) {
    return new Response(JSON.stringify({ error: 'Token and photos array are required' }), { status: 400 })
  }

  // Verify token
  let director = null
  for (const field of ['claim_token', 'director_token']) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/funeral_directors?${field}=eq.${encodeURIComponent(token)}&select=id,photos`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    const rows = await res.json()
    if (Array.isArray(rows) && rows.length) { director = rows[0]; break }
  }

  if (!director) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 })
  }

  // Only keep URLs that already exist in this director's photos (prevents injection)
  const current = new Set(director.photos || [])
  const safe    = photos.filter(u => current.has(u))

  await fetch(
    `${SUPABASE_URL}/rest/v1/funeral_directors?id=eq.${director.id}`,
    {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ photos: safe }),
    }
  )

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
}
