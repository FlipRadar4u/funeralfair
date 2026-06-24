'use strict'

const SUPABASE_URL = 'https://lgqgviyqqubjvuansump.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWd2aXlxcXVianZ1YW5zdW1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc0OTQ2NCwiZXhwIjoyMDk0MzI1NDY0fQ.TKoT1bPae7-dDL6fI2QDpUjc-KSfqGnpniCD93E0it0'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES     = 8 * 1024 * 1024 // 8 MB

export async function onRequestPost(context) {
  const formData = await context.request.formData()
  const token    = formData.get('token')
  const file     = formData.get('file')

  if (!token || !file) {
    return new Response(JSON.stringify({ error: 'Token and file are required' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return new Response(JSON.stringify({ error: 'Only JPEG, PNG and WebP are allowed' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  const buffer = await file.arrayBuffer()
  if (buffer.byteLength > MAX_BYTES) {
    return new Response(JSON.stringify({ error: 'File too large (max 8 MB)' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  // Verify token — try claim_token first (new dashboard), fall back to director_token (legacy)
  let rows = []
  const claimRes = await fetch(
    `${SUPABASE_URL}/rest/v1/funeral_directors?claim_token=eq.${encodeURIComponent(token)}&select=id,photos,pending_photos,is_featured`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  )
  rows = await claimRes.json()

  if (!rows.length) {
    const legacyRes = await fetch(
      `${SUPABASE_URL}/rest/v1/funeral_directors?director_token=eq.${encodeURIComponent(token)}&select=id,photos,pending_photos,is_featured`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    rows = await legacyRes.json()
  }

  if (!rows.length) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  // Enforce photo limit
  const maxPhotos   = rows[0].is_featured ? 10 : 1
  const totalPhotos = (rows[0].photos?.length || 0) + (rows[0].pending_photos?.length || 0)
  if (totalPhotos >= maxPhotos) {
    const msg = rows[0].is_featured
      ? 'Photo limit reached — Featured listings can upload up to 10 photos.'
      : 'Free listings include 1 photo. Upgrade to Featured to upload up to 10.'
    return new Response(JSON.stringify({ error: msg }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  const director = rows[0]
  const ext      = file.type.split('/')[1].replace('jpeg', 'jpg')
  const filename = `${director.id}/${crypto.randomUUID()}.${ext}`

  // Upload to Supabase Storage
  const uploadRes = await fetch(
    `${SUPABASE_URL}/storage/v1/object/director-photos/${filename}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': file.type,
        'x-upsert': 'false',
      },
      body: buffer,
    }
  )

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}))
    console.error('Storage error:', err)
    return new Response(JSON.stringify({ error: 'Upload failed' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  const publicUrl     = `${SUPABASE_URL}/storage/v1/object/public/director-photos/${filename}`
  const pendingPhotos = [...(director.pending_photos || []), publicUrl]

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
      body: JSON.stringify({ pending_photos: pendingPhotos }),
    }
  )

  return new Response(JSON.stringify({ ok: true, url: publicUrl }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
}
