const SUPABASE_URL = 'https://lgqgviyqqubjvuansump.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWd2aXlxcXVianZ1YW5zdW1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NDk0NjQsImV4cCI6MjA5NDMyNTQ2NH0.BvIyZUKeCjPhqqM9oJRM5NU6nRJYZrZLBBX4X6eXdCg'

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
}

const SELECT = 'id,name,town,postcode,lat,lng,attended_price,cremation_price,nafd_member,saif_member,is_featured,last_updated,google_rating,google_reviews'
const PAGE   = 1000

const MAX_RADIUS = 50

function boundingBox(lat, lng, radiusMiles) {
  const r       = Math.min(radiusMiles, MAX_RADIUS)
  const latDelta = r / 69
  const lngDelta = r / (69 * Math.cos(lat * Math.PI / 180))
  return {
    minLat: (lat - latDelta).toFixed(6),
    maxLat: (lat + latDelta).toFixed(6),
    minLng: (lng - lngDelta).toFixed(6),
    maxLng: (lng + lngDelta).toFixed(6),
  }
}

export async function onRequestGet({ request }) {
  const url     = new URL(request.url)
  const qLat    = parseFloat(url.searchParams.get('lat'))
  const qLng    = parseFloat(url.searchParams.get('lng'))
  const qRadius = parseFloat(url.searchParams.get('radius'))
  const hasBBox = !isNaN(qLat) && !isNaN(qLng) && !isNaN(qRadius)
                  && qLat >= -90 && qLat <= 90
                  && qLng >= -180 && qLng <= 180
                  && qRadius > 0

  let filter = ''
  if (hasBBox) {
    const { minLat, maxLat, minLng, maxLng } = boundingBox(qLat, qLng, qRadius)
    filter = `&lat=gte.${minLat}&lat=lte.${maxLat}&lng=gte.${minLng}&lng=lte.${maxLng}&lat=not.is.null`
  }

  const all = []
  let offset = 0

  try {
    while (true) {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/funeral_directors?select=${SELECT}&order=id.asc${filter}`,
        {
          headers: {
            ...HEADERS,
            Range: `${offset}-${offset + PAGE - 1}`,
            'Range-Unit': 'items',
          },
        }
      )
      if (!res.ok) {
        return new Response(JSON.stringify({ error: 'upstream error', status: res.status }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      const page = await res.json()
      if (!Array.isArray(page) || page.length === 0) break
      all.push(...page)
      if (page.length < PAGE) break
      offset += PAGE
    }
  } catch {
    return new Response(JSON.stringify({ error: 'internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify(all), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}
