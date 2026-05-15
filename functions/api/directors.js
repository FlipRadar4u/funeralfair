const SUPABASE_URL = 'https://lgqgviyqqubjvuansump.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWd2aXlxcXVianZ1YW5zdW1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NDk0NjQsImV4cCI6MjA5NDMyNTQ2NH0.BvIyZUKeCjPhqqM9oJRM5NU6nRJYZrZLBBX4X6eXdCg'

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
}

export async function onRequestGet() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/funeral_directors?select=id,name,town,postcode,attended_price,cremation_price,nafd_member,saif_member,is_featured,last_updated`,
    { headers: HEADERS }
  )
  const body = await res.text()
  return new Response(body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=120' },
  })
}
