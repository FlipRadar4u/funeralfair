import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const RADIUS_MILES = 30

// ─── Geocoding helpers (postcodes.io — free, no API key) ─────────────────────

async function geocodeInput(query) {
  const q = query.trim()
  try {
    // 1. Try as a full postcode
    const r1 = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(q)}`)
    const j1 = await r1.json()
    if (j1.status === 200) {
      return { lat: j1.result.latitude, lng: j1.result.longitude }
    }
    // 2. Try as an outcode (e.g. "L1", "SW1A")
    const r2 = await fetch(`https://api.postcodes.io/outcodes/${encodeURIComponent(q)}`)
    const j2 = await r2.json()
    if (j2.status === 200) {
      return { lat: j2.result.latitude, lng: j2.result.longitude }
    }
  } catch (_) {}
  return null
}

async function bulkGeocodePostcodes(postcodes) {
  if (!postcodes.length) return {}
  try {
    const res = await fetch('https://api.postcodes.io/postcodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postcodes: postcodes.slice(0, 100) }),
    })
    const json = await res.json()
    const map = {}
    for (const item of json.result ?? []) {
      if (item.result) {
        map[item.query] = { lat: item.result.latitude, lng: item.result.longitude }
      }
    }
    return map
  } catch (_) {
    return {}
  }
}

// Extract the outcode (e.g. "L1" from "L1 1AA") for use as a fallback
function extractOutcode(postcode) {
  if (!postcode) return null
  return postcode.trim().toUpperCase().split(' ')[0] || null
}

// For any directors whose full postcode didn't geocode, try their outcode
async function geocodeOutcodes(outcodes) {
  if (!outcodes.length) return {}
  const results = await Promise.all(
    outcodes.map(async oc => {
      try {
        const r = await fetch(`https://api.postcodes.io/outcodes/${encodeURIComponent(oc)}`)
        const j = await r.json()
        return j.status === 200
          ? [oc, { lat: j.result.latitude, lng: j.result.longitude }]
          : null
      } catch (_) {
        return null
      }
    })
  )
  return Object.fromEntries(results.filter(Boolean))
}

// ─── Distance (Haversine) ─────────────────────────────────────────────────────

function haversineMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function fmtMiles(m) {
  return m < 1 ? `${(m * 5280).toFixed(0)} ft` : `${m.toFixed(1)} miles`
}

// ─── UI components ────────────────────────────────────────────────────────────

function formatPrice(val) {
  if (val == null) return '—'
  const n = Number(val)
  if (isNaN(n)) return '—'
  return `£${n.toLocaleString('en-GB')}`
}

function GreenBadge({ label, description }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sage-light border border-sage-border text-sage">
      {label}
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        className="opacity-60 hover:opacity-100 leading-none focus:outline-none"
        aria-label={`About ${label}`}
      >ⓘ</button>
      {open && (
        <span className="absolute top-full left-0 mt-1.5 z-20 bg-white border border-warm-border text-charcoal font-normal rounded-lg shadow-lg px-3 py-2 whitespace-nowrap text-xs">
          {description}
        </span>
      )}
    </span>
  )
}

function PriceCell({ label, value }) {
  return (
    <div className="flex flex-col items-center justify-center bg-cream border border-warm-border rounded-xl px-3 py-4 text-center">
      <span className="text-xs text-muted font-medium mb-1.5 leading-tight">{label}</span>
      <span className="text-xl font-bold text-charcoal tracking-tight">{value}</span>
    </div>
  )
}

function DirectorCard({ director, backUrl, isBestValue }) {
  const attended  = formatPrice(director.attended_price)
  const cremation = formatPrice(director.cremation_price)
  const hasBadge  = director.nafd_member || director.saif_member
  const isFeatured = director.is_featured
  const navigate  = useNavigate()

  return (
    <div className={`card-hover bg-white rounded-2xl border p-6 shadow-sm flex flex-col gap-5 cursor-pointer ${isFeatured ? 'border-sage ring-1 ring-sage' : isBestValue ? 'border-sage/50 ring-1 ring-sage/50' : 'border-warm-border'}`}
      onClick={() => navigate(`/director/${director.id}`, { state: { from: backUrl } })}
    >

      {/* Featured banner */}
      {isFeatured && (
        <div className="-mx-6 -mt-6 mb-1 bg-sage text-white text-xs font-semibold text-center py-1.5 rounded-t-2xl tracking-wide">
          Featured
        </div>
      )}

      {/* Best value banner (non-featured only) */}
      {!isFeatured && isBestValue && (
        <div className="-mx-6 -mt-6 mb-1 bg-sage/80 text-white text-xs font-semibold text-center py-1.5 rounded-t-2xl tracking-wide">
          Best value nearby
        </div>
      )}

      {/* Name + town + distance + badges */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-semibold text-charcoal text-base leading-snug">
            {director.name}
          </h2>
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            <p className="text-sm text-muted">{director.town}</p>
            {director._miles != null && (
              <>
                <span className="text-muted text-xs">·</span>
                <span className="text-xs font-medium text-sage">{fmtMiles(director._miles)} away</span>
              </>
            )}
          </div>
        </div>
        {hasBadge && (
          <div className="flex gap-1.5 shrink-0 flex-wrap justify-end pt-0.5">
            {director.nafd_member && <GreenBadge label="NAFD member" description="National Association of Funeral Directors" />}
            {director.saif_member && <GreenBadge label="SAIF member" description="Society of Allied & Independent Funeral Directors" />}
          </div>
        )}
      </div>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-3">
        <PriceCell label="Attended funeral" value={attended} />
        <PriceCell label="Direct cremation" value={cremation} />
      </div>

      {/* CTA */}
      <button
        onClick={e => { e.stopPropagation(); navigate(`/director/${director.id}`, { state: { from: backUrl } }) }}
        className="w-full py-2.5 rounded-xl bg-sage text-white font-semibold text-sm hover:bg-sage-dark mt-auto"
      >
        View details →
      </button>
    </div>
  )
}

function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <div
        className="w-9 h-9 rounded-full border-2 border-sage animate-spin"
        style={{ borderTopColor: 'transparent' }}
      />
      {label && <p className="text-sm text-muted">{label}</p>}
    </div>
  )
}

function EmptyState({ location, isProximity }) {
  return (
    <div className="flex flex-col items-center text-center py-24 px-4">
      <div className="w-16 h-16 rounded-full bg-sage-light flex items-center justify-center mb-5">
        <svg className="w-7 h-7 text-sage" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 15.803 7.5 7.5 0 0 0 15.803 15.803z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-charcoal mb-2">
        No results for &ldquo;{location}&rdquo;
      </h2>
      <p className="text-muted text-sm max-w-xs leading-relaxed">
        {isProximity
          ? `We couldn't find any funeral directors within ${RADIUS_MILES} miles of that postcode. Try a nearby town name instead.`
          : "We couldn't find any funeral directors matching that location. Try a nearby town or check the spelling."}
      </p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const location = searchParams.get('location') || ''

  const [inputValue,   setInputValue]   = useState(location)
  const [results,      setResults]      = useState([])
  const [loading,      setLoading]      = useState(false)
  const [loadingLabel, setLoadingLabel] = useState('Searching…')
  const [fetchError,   setFetchError]   = useState(null)
  const [searchMode,   setSearchMode]   = useState(null) // 'proximity' | 'text'
  const navigate = useNavigate()

  useEffect(() => { setInputValue(location) }, [location])

  useEffect(() => {
    if (!location) return
    let cancelled = false

    async function run() {
      setLoading(true)
      setFetchError(null)
      setResults([])
      setSearchMode(null)
      setLoadingLabel('Looking up postcode…')

      // ── Step 1: try to geocode the search input ──────────────────────────
      const userCoords = await geocodeInput(location)

      if (cancelled) return

      if (userCoords) {
        // ── Proximity search ────────────────────────────────────────────────
        setLoadingLabel('Finding nearby funeral directors…')

        const { data, error } = await supabase
          .from('funeral_directors')
          .select('id, name, town, postcode, attended_price, cremation_price, nafd_member, saif_member, is_featured')

        if (cancelled) return
        if (error) { setFetchError(error.message); setLoading(false); return }

        const directors = data ?? []

        // Step 1: bulk-geocode full postcodes
        const postcodes    = [...new Set(directors.map(d => d.postcode).filter(Boolean))]
        const fullGeocoded = await bulkGeocodePostcodes(postcodes)

        // Step 2: for any that failed, try the outcode (e.g. "L1" from "L1 1AA")
        const needOutcode    = directors.filter(d => d.postcode && !fullGeocoded[d.postcode])
        const uniqueOutcodes = [...new Set(needOutcode.map(d => extractOutcode(d.postcode)).filter(Boolean))]
        const outcodeGeocoded = await geocodeOutcodes(uniqueOutcodes)

        if (cancelled) return

        // Calculate distance — prefer full postcode coords, fall back to outcode
        // Featured directors are sorted first, then by distance within each group
        const withDist = directors
          .map(d => {
            const coords = fullGeocoded[d.postcode] ?? outcodeGeocoded[extractOutcode(d.postcode)]
            if (!coords) return null
            const miles = haversineMiles(userCoords.lat, userCoords.lng, coords.lat, coords.lng)
            return { ...d, _miles: miles }
          })
          .filter(d => d !== null && d._miles <= RADIUS_MILES)
          .sort((a, b) => {
            if (a.is_featured && !b.is_featured) return -1
            if (!a.is_featured && b.is_featured) return 1
            return a._miles - b._miles
          })

        setResults(withDist)
        setSearchMode('proximity')

      } else {
        // ── Text search fallback (town / postcode string match) ─────────────
        setLoadingLabel('Searching…')

        const { data, error } = await supabase
          .from('funeral_directors')
          .select('id, name, town, postcode, attended_price, cremation_price, nafd_member, saif_member, is_featured')
          .or(`town.ilike.%${location}%,postcode.ilike.%${location}%`)
          .order('is_featured', { ascending: false })
          .order('attended_price', { ascending: true })

        if (cancelled) return
        if (error) setFetchError(error.message)
        else setResults(data ?? [])
        setSearchMode('text')
      }

      setLoading(false)
    }

    run()
    return () => { cancelled = true }
  }, [location])

  function handleSearch(e) {
    e.preventDefault()
    const q = inputValue.trim()
    if (q) navigate(`/search?location=${encodeURIComponent(q)}`)
  }

  const resultCount = results.length
  const backUrl     = `/search?location=${encodeURIComponent(location)}`
  const isProximity = searchMode === 'proximity'

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-5 sm:px-6 py-6 sm:py-12">

        {/* ── Search bar ── */}
        <form onSubmit={handleSearch} className="flex gap-2 sm:gap-3 mb-8">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Postcode or town…"
            className="flex-1 px-4 py-3.5 rounded-xl border border-warm-border bg-white text-charcoal placeholder-muted text-base focus:outline-none focus:ring-2 focus:ring-sage shadow-sm"
          />
          <button
            type="submit"
            className="px-5 sm:px-7 py-3.5 bg-sage hover:bg-sage-dark active:bg-sage-dark text-white font-semibold rounded-xl shadow-sm text-sm sm:text-base whitespace-nowrap"
          >
            Search
          </button>
        </form>

        {/* ── Heading ── */}
        {location && !loading && (
          <div className="mb-6">
            <h1 className="text-xl sm:text-3xl font-bold text-charcoal leading-snug">
              {isProximity
                ? <>Funeral directors within {RADIUS_MILES} miles of <span className="text-sage">{location.toUpperCase()}</span></>
                : <>Funeral directors near <span className="text-sage">{location}</span></>}
            </h1>
            {!fetchError && (
              <p className="text-muted mt-1 text-sm">
                {resultCount === 0
                  ? 'No results found.'
                  : isProximity
                    ? `${resultCount} director${resultCount !== 1 ? 's' : ''} · sorted by distance`
                    : `${resultCount} director${resultCount !== 1 ? 's' : ''} · sorted by lowest price`}
              </p>
            )}
          </div>
        )}

        {/* ── States ── */}
        {loading && <Spinner label={loadingLabel} />}

        {!loading && fetchError && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-red-700 text-sm">
            Something went wrong: {fetchError}
          </div>
        )}

        {!loading && !fetchError && !location && (
          <p className="text-center text-muted py-24 text-sm">
            Enter your postcode or town above to find funeral directors near you.
          </p>
        )}

        {!loading && !fetchError && location && resultCount === 0 && (
          <EmptyState location={location} isProximity={isProximity} />
        )}

        {/* ── Results ── */}
        {!loading && !fetchError && resultCount > 0 && (
          <>
            <p className="text-sm text-muted bg-white border border-warm-border rounded-xl px-4 py-3 mb-5 leading-relaxed">
              We know you didn't choose to be here. Prices come directly from legally required Standardised Price Lists — compare with confidence, at your own pace.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {results.map((fd, i) => {
                const firstNonFeatured = results.findIndex(r => !r.is_featured)
                return (
                  <DirectorCard
                    key={fd.id}
                    director={fd}
                    backUrl={backUrl}
                    isBestValue={!fd.is_featured && i === firstNonFeatured}
                  />
                )
              })}
            </div>
          </>
        )}

      </main>

      <Footer />
    </div>
  )
}
