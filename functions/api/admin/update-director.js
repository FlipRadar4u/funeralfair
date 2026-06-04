'use strict'

const SUPABASE_URL = 'https://lgqgviyqqubjvuansump.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWd2aXlxcXVianZ1YW5zdW1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc0OTQ2NCwiZXhwIjoyMDk0MzI1NDY0fQ.TKoT1bPae7-dDL6fI2QDpUjc-KSfqGnpniCD93E0it0'

export async function onRequestPost(context) {
  const pw = new URL(context.request.url).searchParams.get('pw')
  if (!pw || pw !== context.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    })
  }

  let body
  try { body = await context.request.json() } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { id, ...updates } = body
  if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 })

  // Only allow safe fields
  const allowed = ['name','town','postcode','website',
                   'attended_price','cremation_price','nafd_member','saif_member',
                   'is_featured','verified']
  const patch = {}
  for (const k of allowed) {
    if (k in updates) patch[k] = updates[k]
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/funeral_directors?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(patch),
    }
  )
  return new Response(null, { status: res.ok ? 200 : res.status })
}
