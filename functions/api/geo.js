export async function onRequestGet(context) {
  const cf = context.request.cf
  return new Response(JSON.stringify({
    city:   cf?.city   || null,
    region: cf?.region || null,
    lat:    cf?.latitude  ? parseFloat(cf.latitude)  : null,
    lng:    cf?.longitude ? parseFloat(cf.longitude) : null,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}
