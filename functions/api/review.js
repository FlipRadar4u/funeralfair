'use strict'

const SUPABASE_URL = 'https://lgqgviyqqubjvuansump.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWd2aXlxcXVianZ1YW5zdW1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc0OTQ2NCwiZXhwIjoyMDk0MzI1NDY0fQ.TKoT1bPae7-dDL6fI2QDpUjc-KSfqGnpniCD93E0it0'

export async function onRequestPost(context) {
  let body
  try { body = await context.request.json() } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 })
  }

  const { directorId, reviewerName, rating, reviewBody } = body

  if (!directorId || !reviewerName?.trim() || !reviewBody?.trim()) {
    return new Response(JSON.stringify({ error: 'Name and review text are required.' }), { status: 400 })
  }

  const r = Number(rating)
  if (!Number.isInteger(r) || r < 1 || r > 5) {
    return new Response(JSON.stringify({ error: 'Rating must be 1–5.' }), { status: 400 })
  }

  const trimmedBody = reviewBody.trim()
  if (trimmedBody.length < 20) {
    return new Response(JSON.stringify({ error: 'Review must be at least 20 characters.' }), { status: 400 })
  }
  if (trimmedBody.length > 1000) {
    return new Response(JSON.stringify({ error: 'Review must be under 1,000 characters.' }), { status: 400 })
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      director_id:   String(directorId),
      reviewer_name: reviewerName.trim(),
      rating:        r,
      body:          trimmedBody,
    }),
  })

  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to submit review.' }), { status: 500 })
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
}
