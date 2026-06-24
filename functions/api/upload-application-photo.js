const SUPABASE_URL = 'https://lgqgviyqqubjvuansump.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWd2aXlxcXVianZ1YW5zdW1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc0OTQ2NCwiZXhwIjoyMDk0MzI1NDY0fQ.TKoT1bPae7-dDL6fI2QDpUjc-KSfqGnpniCD93E0it0'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES     = 8 * 1024 * 1024 // 8 MB

export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData()
    const file     = formData.get('file')

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
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

    const ext      = file.type.split('/')[1].replace('jpeg', 'jpg')
    const filename = `applications/${crypto.randomUUID()}.${ext}`

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
      return new Response(JSON.stringify({ error: 'Upload failed' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      })
    }

    const url = `${SUPABASE_URL}/storage/v1/object/public/director-photos/${filename}`
    return new Response(JSON.stringify({ ok: true, url }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Upload failed' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}
