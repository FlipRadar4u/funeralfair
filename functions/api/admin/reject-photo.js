'use strict'

const SUPABASE_URL = 'https://lgqgviyqqubjvuansump.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWd2aXlxcXVianZ1YW5zdW1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc0OTQ2NCwiZXhwIjoyMDk0MzI1NDY0fQ.TKoT1bPae7-dDL6fI2QDpUjc-KSfqGnpniCD93E0it0'

export async function onRequestPost(context) {
  const { pw, directorId, photoUrl } = await context.request.json()
  if (!pw || pw !== context.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/funeral_directors?id=eq.${directorId}&select=pending_photos`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  )
  const [director] = await res.json()
  if (!director) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404, headers: { 'Content-Type': 'application/json' },
    })
  }

  const newPending = (director.pending_photos || []).filter(u => u !== photoUrl)

  await fetch(
    `${SUPABASE_URL}/rest/v1/funeral_directors?id=eq.${directorId}`,
    {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ pending_photos: newPending }),
    }
  )

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
}
