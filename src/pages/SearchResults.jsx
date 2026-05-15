import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const RADIUS_MILES = 30

// ─── Geocoding helpers (postcodes.io — free, no API key) ─────────────────────

function fetchWithTimeout(url, options = {}, ms = 8000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), ms)
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(id))
}

async function geocodeInput(query) {
  const q = query.trim()
  try {
    const r1 = await fetchWithTimeout(`https://api.postcodes.io/postcodes/${encodeURIComponent(q)}`)
    const j1 = await r1.json()
    if (j1.status === 200) {
      return { lat: j1.result.latitude, lng: j1.result.longitude }
    }
    const r2 = await fetchWithTimeout(`https://api.postcodes.io/outcodes/${encodeURIComponent(q)}`)
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
    const res = await fetchWithTimeout('https://api.postcodes.io/postcodes', {
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

function extractOutcode(postcode) {
  if (!postcode) return null
  return postcode.trim().toUpperCase().split(' ')[0] || null
}

async function geocodeOutcodes(outcodes) {
  if (!outcodes.length) return {}
  const results = await Promise.all(
    outcodes.map(async oc => {
      try {
        const r = await fetchWithTimeout(`https://api.postcodes.io/outcodes/${encodeURIComponent(oc)}`)
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

function DirectorCard({ director, backUrl, inFeaturedSection = false }) {
  const attended  = formatPrice(director.attended_price)
  const cremation = formatPrice(director.cremation_price)
  const hasBadge  = director.nafd_member || director.saif_member
  const navigate  = useNavigate()

  const lastUpdated = director.last_updated
    ? new Date(director.last_updated).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : 'May 2025'

  return (
    <div
      className={`card-hover bg-white rounded-2xl border p-6 shadow-sm flex flex-col gap-5 cursor-pointer ${inFeaturedSection ? 'border-sage ring-1 ring-sage' : 'border-warm-border'}`}
      onClick={() => navigate(`/director/${director.id}`, { state: { from: backUrl } })}
    >

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

      {/* Last updated */}
      <p className="text-xs text-muted text-center -mb-1">Last updated: {lastUpdated}</p>
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
  const [sortBy,       setSortBy]       = useState('distance') // 'distance' | 'attended' | 'cremation'
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
      setSortBy('distance')
      setLoadingLabel('Looking up postcode…')

      try {
        // ── Step 1: try to geocode the search input ────────────────────────
        const userCoords = await geocodeInput(location)

        if (cancelled) return

        if (userCoords) {
          // ── Proximity search ──────────────────────────────────────────────
          setLoadingLabel('Loading directors…')

          const apiRes = await fetchWithTimeout('/api/directors')
          if (!apiRes.ok) { setFetchError(`Error loading directors (${apiRes.status})`); return }
          if (cancelled) return
          const directors = await apiRes.json()

          // Bulk-geocode full postcodes
          setLoadingLabel('Mapping postcodes…')
          const postcodes     = [...new Set(directors.map(d => d.postcode).filter(Boolean))]
          const fullGeocoded  = await bulkGeocodePostcodes(postcodes)

          // Fall back to outcode for any that didn't geocode
          const needOutcode    = directors.filter(d => d.postcode && !fullGeocoded[d.postcode])
          const uniqueOutcodes = [...new Set(needOutcode.map(d => extractOutcode(d.postcode)).filter(Boolean))]
          const outcodeGeocoded = await geocodeOutcodes(uniqueOutcodes)

          if (cancelled) return

          setLoadingLabel('Calculating distances…')
          const withDist = directors
            .map(d => {
              const coords = fullGeocoded[d.postcode] ?? outcodeGeocoded[extractOutcode(d.postcode)]
              if (!coords) return null
              const miles = haversineMiles(userCoords.lat, userCoords.lng, coords.lat, coords.lng)
              return { ...d, _miles: miles }
            })
            .filter(d => d !== null && d._miles <= RADIUS_MILES)

          setResults(withDist)
          setSearchMode('proximity')
          setSortBy('distance')

        } else {
          // ── Text search fallback ──────────────────────────────────────────
          setLoadingLabel('Searching…')

          const apiRes = await fetchWithTimeout('/api/directors')
          if (cancelled) return
          if (!apiRes.ok) { setFetchError(`Error loading directors (${apiRes.status})`); return }
          const all = await apiRes.json()
          const q = location.toLowerCase()
          const filtered = all
            .filter(d => d.town?.toLowerCase().includes(q) || d.postcode?.toLowerCase().includes(q))
          setResults(filtered)
          setSearchMode('text')
          setSortBy('attended')
        }
      } catch (err) {
        if (!cancelled) setFetchError('Something went wrong. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
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
          <div className="mb-5">
            <h1 className="text-xl sm:text-3xl font-bold text-charcoal leading-snug">
              {isProximity
                ? <>Funeral directors within {RADIUS_MILES} miles of <span className="text-sage">{location.toUpperCase()}</span></>
                : <>Funeral directors near <span className="text-sage">{location}</span></>}
            </h1>
            {!fetchError && resultCount > 0 && (
              <p className="text-muted mt-1 text-sm">
                {resultCount} director{resultCount !== 1 ? 's' : ''} found
              </p>
            )}
            {!fetchError && resultCount === 0 && (
              <p className="text-muted mt-1 text-sm">No results found.</p>
            )}
          </div>
        )}

        {/* ── Sort controls ── */}
        {!loading && !fetchError && resultCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <span className="text-xs text-muted font-medium mr-1">Sort by:</span>
            {isProximity && (
              <button
                onClick={() => setSortBy('distance')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${sortBy === 'distance' ? 'bg-sage text-white border-sage' : 'bg-white text-muted border-warm-border hover:border-sage hover:text-charcoal'}`}
              >
                Nearest first
              </button>
            )}
            <button
              onClick={() => setSortBy('attended')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${sortBy === 'attended' ? 'bg-sage text-white border-sage' : 'bg-white text-muted border-warm-border hover:border-sage hover:text-charcoal'}`}
            >
              Attended: cheapest first
            </button>
            <button
              onClick={() => setSortBy('cremation')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${sortBy === 'cremation' ? 'bg-sage text-white border-sage' : 'bg-white text-muted border-warm-border hover:border-sage hover:text-charcoal'}`}
            >
              Cremation: cheapest first
            </button>
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
          <div className="mt-4">

            {/* How it works */}
            <p className="text-center text-xs font-semibold tracking-widest uppercase text-muted mb-8">
              How it works
            </p>

            <div className="relative flex flex-col sm:flex-row items-start sm:items-start justify-center gap-10 sm:gap-0 mb-12">

              {/* Dashed connector — desktop only */}
              <div className="hidden sm:block absolute top-5 left-1/2 -translate-x-1/2 w-[55%] border-t border-dashed border-warm-border" style={{ zIndex: 0 }} />

              {[
                { n: 1, label: 'Enter your location', sub: 'Postcode or town name' },
                { n: 2, label: 'Compare prices',      sub: 'Real prices from local funeral directors' },
                { n: 3, label: 'Contact direct',      sub: 'No middleman, no sales calls' },
              ].map(({ n, label, sub }) => (
                <div key={n} className="relative flex flex-col items-center text-center sm:flex-1 px-4" style={{ zIndex: 1 }}>
                  <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center mb-3 shrink-0">
                    <span className="text-white text-sm font-bold">{n}</span>
                  </div>
                  <p className="font-semibold text-charcoal text-sm mb-1">{label}</p>
                  <p className="text-muted text-xs leading-relaxed max-w-[160px]">{sub}</p>
                </div>
              ))}
            </div>

            {/* Trust bar */}
            <div className="bg-white border border-warm-border rounded-2xl px-6 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 flex-wrap">
                {[
                  'No account needed',
                  'Completely free',
                  'No sales calls',
                  '208 funeral directors listed',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-sage shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-charcoal font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {!loading && !fetchError && location && resultCount === 0 && (
          <EmptyState location={location} isProximity={isProximity} />
        )}

        {/* ── Results ── */}
        {!loading && !fetchError && resultCount > 0 && (() => {
          const featured = results.filter(r => r.is_featured)
          const regular  = results.filter(r => !r.is_featured)
          const sorted   = [...regular].sort((a, b) => {
            if (sortBy === 'attended')  return (a.attended_price  ?? 999999) - (b.attended_price  ?? 999999)
            if (sortBy === 'cremation') return (a.cremation_price ?? 999999) - (b.cremation_price ?? 999999)
            return (a._miles ?? 999) - (b._miles ?? 999)
          })
          return (
            <>
              {/* Featured Partner section */}
              {featured.length > 0 && (
                <div className="mb-6 rounded-2xl border-2 border-sage bg-sage-light/30 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-block bg-sage text-white text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase">
                      Featured Partner
                    </span>
                    <Link to="/how-we-rank" className="text-xs text-muted hover:text-sage underline underline-offset-2">
                      What is this?
                    </Link>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featured.map(fd => (
                      <DirectorCard key={fd.id} director={fd} backUrl={backUrl} inFeaturedSection />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular results */}
              {sorted.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {sorted.map(fd => (
                    <DirectorCard key={fd.id} director={fd} backUrl={backUrl} />
                  ))}
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-xs text-muted text-center mt-8 leading-relaxed">
                Prices are sourced from the provider's published Standardised Price List (SPL). Please verify final costs with the director before booking.{' '}
                <Link to="/how-we-rank" className="underline underline-offset-2 hover:text-sage">How we rank results</Link>
              </p>
            </>
          )
        })()}

      </main>

      <Footer />
    </div>
  )
}
