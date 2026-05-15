const SUPABASE_URL = 'https://lgqgviyqqubjvuansump.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWd2aXlxcXVianZ1YW5zdW1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NDk0NjQsImV4cCI6MjA5NDMyNTQ2NH0.BvIyZUKeCjPhqqM9oJRM5NU6nRJYZrZLBBX4X6eXdCg'

export async function onRequestGet(context) {
  const { id } = context.params
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/funeral_directors?id=eq.${id}&select=*`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  )
  const data = await res.json()
  const director = Array.isArray(data) ? data[0] ?? null : null
  return new Response(JSON.stringify(director), {
    status: director ? 200 : 404,
    headers: { 'Content-Type': 'application/json' },
  })
}
