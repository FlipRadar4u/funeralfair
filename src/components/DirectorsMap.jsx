import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'

// Custom sage-green pins — created once at module load, not per render
function makePin(fill) {
  const svg = `<svg width="22" height="30" viewBox="0 0 22 30" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 0C4.925 0 0 4.925 0 11c0 8.25 11 19 11 19s11-10.75 11-19C22 4.925 17.075 0 11 0z" fill="${fill}" stroke="white" stroke-width="1.5"/>
    <circle cx="11" cy="11" r="4" fill="white"/>
  </svg>`
  return L.divIcon({ className: '', html: svg, iconSize: [22, 30], iconAnchor: [11, 30], popupAnchor: [0, -32] })
}

const PIN_DEFAULT  = makePin('#4d7a51')
const PIN_FEATURED = makePin('#5a7e5e')

const PIN_USER = L.divIcon({
  className: '',
  html: `<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.27 21.73 0 14 0z" fill="#2c3e2d" stroke="white" stroke-width="2"/>
    <circle cx="14" cy="14" r="6" fill="white"/>
    <circle cx="14" cy="14" r="3.5" fill="#2c3e2d"/>
  </svg>`,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -38],
})

function BoundsFitter({ directors }) {
  const map = useMap()
  useEffect(() => {
    const pts = directors.filter(d => d.lat && d.lng).map(d => [d.lat, d.lng])
    if (pts.length === 0) return
    if (pts.length === 1) { map.setView(pts[0], 13); return }
    map.fitBounds(pts, { padding: [40, 40], maxZoom: 13 })
  }, [directors, map])
  return null
}

function fmt(val) {
  if (val == null) return null
  const n = Number(val)
  return isNaN(n) ? null : `£${n.toLocaleString('en-GB')}`
}

export default function DirectorsMap({ directors, onView, userCoords, radiusMiles = 20 }) {
  const valid = directors.filter(d => d.lat && d.lng)
  const center = userCoords
    ? [userCoords.lat, userCoords.lng]
    : valid.length > 0 ? [valid[0].lat, valid[0].lng] : [51.5074, -0.1278]

  const radiusMetres = radiusMiles * 1609.34

  return (
    <MapContainer
      center={center}
      zoom={11}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
      />
      <BoundsFitter directors={valid} />
      {userCoords && (
        <>
          <Circle
            center={[userCoords.lat, userCoords.lng]}
            radius={radiusMetres}
            pathOptions={{ color: '#4d7a51', fillColor: '#4d7a51', fillOpacity: 0.06, weight: 1.5, dashArray: '5 5' }}
          />
          <Marker position={[userCoords.lat, userCoords.lng]} icon={PIN_USER} zIndexOffset={1000}>
            <Popup minWidth={130}>
              <p style={{ fontWeight: 600, fontSize: 13, color: '#2c2c2c', margin: 0 }}>Your search location</p>
            </Popup>
          </Marker>
        </>
      )}
      {valid.map(d => (
        <Marker key={d.id} position={[d.lat, d.lng]} icon={d.is_featured ? PIN_FEATURED : PIN_DEFAULT}>
          <Popup minWidth={190}>
            <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              {d.is_featured && (
                <p style={{ fontSize: 10, fontWeight: 700, color: '#4d7a51', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  Featured
                </p>
              )}
              <p style={{ fontWeight: 700, fontSize: 14, color: '#2c2c2c', marginBottom: 2, lineHeight: 1.3 }}>{d.name}</p>
              <p style={{ fontSize: 12, color: '#6b6560', marginBottom: 10 }}>{d.town}{d.postcode ? ` · ${d.postcode}` : ''}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
                {[
                  { label: 'Attended', val: fmt(d.attended_price) },
                  { label: 'Cremation', val: fmt(d.cremation_price) },
                ].map(({ label, val }) => (
                  <div key={label} style={{ background: '#faf8f6', border: '1px solid #e8e2db', borderRadius: 8, padding: '6px 4px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#6b6560', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: val ? '#2c2c2c' : '#9c968f' }}>{val ?? '—'}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onView(d.id)}
                style={{
                  width: '100%', padding: '8px 0', background: '#4d7a51', color: '#fff',
                  border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 12,
                  cursor: 'pointer', letterSpacing: '0.01em',
                }}
              >
                View listing →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
