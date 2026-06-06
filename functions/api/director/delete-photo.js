'use strict'

const SUPABASE_URL = 'https://lgqgviyqqubjvuansump.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWd2aXlxcXVianZ1YW5zdW1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc0OTQ2NCwiZXhwIjoyMDk0MzI1NDY0fQ.TKoT1bPae7-dDL6fI2QDpUjc-KSfqGnpniCD93E0it0'

export async function onRequestPost(context) {
  let body
  try { body = await context.request.json() } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 })
  }

  const { token, url } = body
  if (!token || !url) {
    return new Response(JSON.stringify({ error: 'Token and url are required' }), { status: 400 })
  }

  // Verify token — try claim_token then legacy director_token
  let director = null
  for (const field of ['claim_token', 'director_token']) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/funeral_directors?${field}=eq.${encodeURIComponent(token)}&select=id,photos,pending_photos`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    const rows = await res.json()
    if (Array.isArray(rows) && rows.length) { director = rows[0]; break }
  }

  if (!director) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 })
  }

  // Confirm URL belongs to this director
  const inPhotos  = (director.photos || []).includes(url)
  const inPending = (director.pending_photos || []).includes(url)
  if (!inPhotos && !inPending) {
    return new Response(JSON.stringify({ error: 'Photo not found' }), { status: 404 })
  }

  const field   = inPhotos ? 'photos' : 'pending_photos'
  const newArr  = (director[field] || []).filter(u => u !== url)

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
      body: JSON.stringify({ [field]: newArr }),
    }
  )

  // Delete from Supabase Storage — extract path from public URL
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/director-photos/`
  if (url.startsWith(prefix)) {
    const path = url.slice(prefix.length)
    await fetch(
      `${SUPABASE_URL}/storage/v1/object/director-photos/${path}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${SUPABASE_KEY}` } }
    ).catch(() => {})
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
}
