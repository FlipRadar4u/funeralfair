import { useEffect, useState, lazy, Suspense } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCompare } from '../context/CompareContext'
import { CITIES } from '../data/cities'

const DirectorsMap = lazy(() => import('../components/DirectorsMap'))

const RADIUS_MILES = 30

function fetchWithTimeout(url, options = {}, ms = 8000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), ms)
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(id))
}

async function geocodeInput(query) {
  const q = query.trim()

  // Match known city names first (e.g. "London", "Manchester")
  const cityMatch = Object.values(CITIES).find(
    c => c.name.toLowerCase() === q.toLowerCase()
  )
  if (cityMatch) return { lat: cityMatch.lat, lng: cityMatch.lng }

  // Fall back to postcodes.io for postcodes and outcode areas
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
  if (m < 0.1) return 'Nearby'
  return `${m.toFixed(1)} miles`
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

function StarRating({ rating, reviews }) {
  if (!rating) return null
  return (
    <span className="flex items-center gap-1">
      <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
      </svg>
      <span className="text-xs font-semibold text-charcoal">{Number(rating).toFixed(1)}</span>
      {reviews > 0 && <span className="text-xs text-muted">({reviews.toLocaleString()} reviews)</span>}
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
  const { add, remove, isInList, list } = useCompare()
  const inCompare  = isInList(director.id)
  const listFull   = list.length >= 3 && !inCompare

  const lastUpdated = director.last_updated
    ? new Date(director.last_updated).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : null

  return (
    <div
      className={`card-hover bg-white rounded-2xl border p-6 shadow-sm flex flex-col gap-5 cursor-pointer ${inFeaturedSection ? 'border-sage ring-1 ring-sage' : 'border-warm-border'}`}
      onClick={() => navigate(`/director/${director.id}`, { state: { from: backUrl } })}
    >

      {/* Name + town + distance + badges */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-charcoal text-base leading-snug">
            {director.name}
          </h2>
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            <p className="text-sm text-muted">{director.town}</p>
            {director._miles != null && (
              <>
                <span className="text-muted text-xs">·</span>
                <span className="text-xs font-medium text-sage">{director._miles < 0.1 ? 'Nearby' : `${fmtMiles(director._miles)} away`}</span>
              </>
            )}
          </div>
          {director.google_rating && (
            <div className="mt-1.5">
              <StarRating rating={director.google_rating} reviews={director.google_reviews} />
            </div>
          )}
          {hasBadge && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {director.nafd_member && <GreenBadge label="NAFD member" description="National Association of Funeral Directors" />}
              {director.saif_member && <GreenBadge label="SAIF member" description="Society of Allied & Independent Funeral Directors" />}
            </div>
          )}
        </div>
        <div className="shrink-0">
          {director.claimed_at && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sage text-white">
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Listing verified
            </span>
          )}
        </div>
      </div>

      {/* Prices */}
      {director.attended_price != null || director.cremation_price != null ? (
        <div className="grid grid-cols-2 gap-3">
          <PriceCell label="Attended funeral" value={attended} />
          <PriceCell label="Direct cremation" value={cremation} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-cream border border-dashed border-warm-border rounded-xl px-3 py-4 text-center gap-1">
          <span className="text-xs font-medium text-muted">Prices not yet published</span>
          <span className="text-xs text-muted/70">View their listing to enquire</span>
        </div>
      )}

      {/* CTAs */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={e => { e.stopPropagation(); navigate(`/director/${director.id}`, { state: { from: backUrl } }) }}
          className="flex-1 py-2.5 rounded-xl bg-sage text-white font-semibold text-sm hover:bg-sage-dark"
        >
          View details →
        </button>
        <button
          onClick={e => {
            e.stopPropagation()
            inCompare ? remove(director.id) : add(director)
          }}
          disabled={listFull}
          title={listFull ? 'Max 3 directors in compare' : inCompare ? 'Remove from compare' : 'Add to compare'}
          className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
            inCompare
              ? 'bg-sage-light border-sage text-sage'
              : listFull
              ? 'border-warm-border text-muted/40 cursor-not-allowed'
              : 'border-warm-border text-muted hover:border-sage hover:text-sage'
          }`}
        >
          {inCompare ? '✓ Added' : 'Compare'}
        </button>
      </div>

      {/* Last updated */}
      {lastUpdated && <p className="text-xs text-muted text-center -mb-1">Last updated: {lastUpdated}</p>}
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

  const [inputValue,    setInputValue]   = useState(location)
  const [results,       setResults]      = useState([])
  const [loading,       setLoading]      = useState(false)
  const [loadingLabel,  setLoadingLabel] = useState('Searching…')
  const [fetchError,    setFetchError]   = useState(null)
  const [searchMode,    setSearchMode]   = useState(null) // 'proximity' | 'text'
  const [sortBy,           setSortBy]          = useState('distance') // 'distance' | 'attended' | 'cremation'
  const [directorCount,    setDirectorCount]   = useState(null)
  const [maxDistance,      setMaxDistance]      = useState(RADIUS_MILES)
  const [maxAttendedPrice, setMaxAttendedPrice] = useState(null)
  const [maxCremationPrice,setMaxCremationPrice]= useState(null)
  const [filterNafd,       setFilterNafd]       = useState(false)
  const [filterSaif,       setFilterSaif]       = useState(false)
  const [filtersOpen,      setFiltersOpen]      = useState(false)
  const [showMap,          setShowMap]          = useState(false)
  const [userCoords,       setUserCoords]       = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    document.title = location
      ? `Funeral directors near ${location} — FuneralFair`
      : 'Compare Funeral Directors — FuneralFair'
    document.querySelector('meta[name="description"]')?.setAttribute('content',
      location
        ? `Compare funeral directors near ${location}. Real prices for attended funerals and direct cremation — no commission, no account needed.`
        : 'Compare funeral directors near you with real, published prices. No commission, no account needed.'
    )
  }, [location])

  useEffect(() => {
    fetch('/api/director-count')
      .then(r => r.json())
      .then(data => { if (data.count != null) setDirectorCount(data.count) })
      .catch(() => {})
  }, [])

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
      setMaxDistance(RADIUS_MILES)
      setMaxAttendedPrice(null)
      setMaxCremationPrice(null)
      setFilterNafd(false)
      setFilterSaif(false)
      setShowMap(false)
      setUserCoords(null)
      setLoadingLabel('Looking up location…')

      try {
        // ── Step 1: try to geocode the search input ────────────────────────
        const coords = await geocodeInput(location)

        if (cancelled) return

        if (coords) {
          // ── Proximity search ──────────────────────────────────────────────
          setLoadingLabel('Finding directors near you…')

          const apiRes = await fetchWithTimeout('/api/directors')
          if (!apiRes.ok) { setFetchError(`Error loading directors (${apiRes.status})`); return }
          if (cancelled) return
          const directors = await apiRes.json()

          const withDist = directors
            .filter(d => d.lat != null && d.lng != null)
            .map(d => ({ ...d, _miles: haversineMiles(coords.lat, coords.lng, d.lat, d.lng) }))
            .filter(d => d._miles <= RADIUS_MILES)

          setResults(withDist)
          setSearchMode('proximity')
          setSortBy('distance')
          setUserCoords(coords)

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

  const filteredResults = results.filter(d => {
    if (isProximity && d._miles != null && d._miles > maxDistance) return false
    if (maxAttendedPrice  != null && d.attended_price  != null && d.attended_price  > maxAttendedPrice)  return false
    if (maxCremationPrice != null && d.cremation_price != null && d.cremation_price > maxCremationPrice) return false
    if (filterNafd && !d.nafd_member) return false
    if (filterSaif && !d.saif_member) return false
    return true
  })
  const activeFilterCount = [
    isProximity && maxDistance < RADIUS_MILES,
    maxAttendedPrice  != null,
    maxCremationPrice != null,
    filterNafd,
    filterSaif,
  ].filter(Boolean).length
  function clearFilters() {
    setMaxDistance(RADIUS_MILES)
    setMaxAttendedPrice(null)
    setMaxCremationPrice(null)
    setFilterNafd(false)
    setFilterSaif(false)
  }

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
                {activeFilterCount > 0
                  ? `Showing ${filteredResults.length} of ${resultCount} director${resultCount !== 1 ? 's' : ''}`
                  : `${resultCount} director${resultCount !== 1 ? 's' : ''} found`}
              </p>
            )}
            {!fetchError && resultCount === 0 && (
              <p className="text-muted mt-1 text-sm">No results found.</p>
            )}
          </div>
        )}

        {/* ── No commission notice ── */}
        {!loading && !fetchError && resultCount > 0 && (
          <p className="text-xs text-muted mb-5 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-sage shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
            FuneralFair never takes commission from funeral directors. Results are independent and uninfluenced by payments.
          </p>
        )}

        {/* ── Sort + Filter controls ── */}
        {!loading && !fetchError && resultCount > 0 && (
          <div className="mb-6">
            {/* Top row: label (left) + Filters button (right) */}
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs text-muted font-medium shrink-0">Sort by:</span>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-muted hover:text-charcoal underline underline-offset-2 transition-colors"
                    style={{ touchAction: 'manipulation' }}
                  >
                    Clear
                  </button>
                )}
                {isProximity && (
                  <button
                    onClick={() => setShowMap(m => !m)}
                    style={{ touchAction: 'manipulation' }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-colors ${showMap ? 'bg-sage text-white border-sage' : 'bg-white text-muted border-warm-border hover:border-sage hover:text-charcoal'}`}
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                    </svg>
                    {showMap ? 'Hide map' : 'Map'}
                  </button>
                )}
                <button
                  onClick={() => setFiltersOpen(o => !o)}
                  style={{ touchAction: 'manipulation' }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-colors ${filtersOpen || activeFilterCount > 0 ? 'bg-sage text-white border-sage' : 'bg-white text-muted border-warm-border hover:border-sage hover:text-charcoal'}`}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                  </svg>
                  Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                </button>
              </div>
            </div>

            {/* Sort pills + map toggle */}
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {isProximity && (
                <button
                  onClick={() => setSortBy('distance')}
                  style={{ touchAction: 'manipulation' }}
                  className={`shrink-0 px-3 py-2 rounded-full text-xs font-semibold border transition-colors ${sortBy === 'distance' ? 'bg-sage text-white border-sage' : 'bg-white text-muted border-warm-border hover:border-sage hover:text-charcoal'}`}
                >Nearest first</button>
              )}
              <button
                onClick={() => setSortBy('attended')}
                style={{ touchAction: 'manipulation' }}
                className={`shrink-0 px-3 py-2 rounded-full text-xs font-semibold border transition-colors ${sortBy === 'attended' ? 'bg-sage text-white border-sage' : 'bg-white text-muted border-warm-border hover:border-sage hover:text-charcoal'}`}
              >Attended: lowest price</button>
              <button
                onClick={() => setSortBy('cremation')}
                style={{ touchAction: 'manipulation' }}
                className={`shrink-0 px-3 py-2 rounded-full text-xs font-semibold border transition-colors ${sortBy === 'cremation' ? 'bg-sage text-white border-sage' : 'bg-white text-muted border-warm-border hover:border-sage hover:text-charcoal'}`}
              >Cremation: lowest price</button>
            </div>

            {/* Filter panel */}
            {filtersOpen && (
              <div className="mt-3 bg-white border border-warm-border rounded-2xl p-5 grid sm:grid-cols-2 gap-5">
                {isProximity && (
                  <div>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Distance</p>
                    <div className="flex gap-2 flex-wrap">
                      {[5, 10, 20, RADIUS_MILES].map(d => (
                        <button
                          key={d}
                          onClick={() => setMaxDistance(d)}
                          style={{ touchAction: 'manipulation' }}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${maxDistance === d ? 'bg-sage text-white border-sage' : 'bg-cream text-muted border-warm-border hover:border-sage hover:text-charcoal'}`}
                        >
                          {d === RADIUS_MILES ? `Up to ${d} mi` : `Within ${d} mi`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Attended funeral</p>
                  <div className="flex gap-2 flex-wrap">
                    {[2000, 3000, 4000, 5000].map(p => (
                      <button
                        key={p}
                        onClick={() => setMaxAttendedPrice(maxAttendedPrice === p ? null : p)}
                        style={{ touchAction: 'manipulation' }}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${maxAttendedPrice === p ? 'bg-sage text-white border-sage' : 'bg-cream text-muted border-warm-border hover:border-sage hover:text-charcoal'}`}
                      >
                        Under £{p.toLocaleString('en-GB')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Direct cremation</p>
                  <div className="flex gap-2 flex-wrap">
                    {[1000, 1500, 2000].map(p => (
                      <button
                        key={p}
                        onClick={() => setMaxCremationPrice(maxCremationPrice === p ? null : p)}
                        style={{ touchAction: 'manipulation' }}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${maxCremationPrice === p ? 'bg-sage text-white border-sage' : 'bg-cream text-muted border-warm-border hover:border-sage hover:text-charcoal'}`}
                      >
                        Under £{p.toLocaleString('en-GB')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Accreditation</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setFilterNafd(v => !v)}
                      style={{ touchAction: 'manipulation' }}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${filterNafd ? 'bg-sage text-white border-sage' : 'bg-cream text-muted border-warm-border hover:border-sage hover:text-charcoal'}`}
                    >NAFD member</button>
                    <button
                      onClick={() => setFilterSaif(v => !v)}
                      style={{ touchAction: 'manipulation' }}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${filterSaif ? 'bg-sage text-white border-sage' : 'bg-cream text-muted border-warm-border hover:border-sage hover:text-charcoal'}`}
                    >SAIF member</button>
                  </div>
                </div>
              </div>
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
          <div className="mt-4">

            {/* How it works */}
            <p className="text-center text-xs font-semibold tracking-widest uppercase text-muted mb-6">
              How it works
            </p>

            {/* Mobile: numbered rows */}
            <div className="sm:hidden flex flex-col gap-5 mb-10">
              {[
                { n: 1, label: 'Enter your location', sub: 'Postcode or town name' },
                { n: 2, label: 'Compare prices',      sub: 'Real prices from local funeral directors' },
                { n: 3, label: 'Contact direct',      sub: 'No middleman, no sales calls' },
              ].map(({ n, label, sub }) => (
                <div key={n} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-bold">{n}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal text-sm leading-snug">{label}</p>
                    <p className="text-muted text-xs mt-0.5 leading-relaxed">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: centered columns with connector line */}
            <div className="hidden sm:flex relative items-start justify-center gap-0 mb-12">
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[55%] border-t border-dashed border-warm-border" style={{ zIndex: 0 }} />
              {[
                { n: 1, label: 'Enter your location', sub: 'Postcode or town name' },
                { n: 2, label: 'Compare prices',      sub: 'Real prices from local funeral directors' },
                { n: 3, label: 'Contact direct',      sub: 'No middleman, no sales calls' },
              ].map(({ n, label, sub }) => (
                <div key={n} className="relative flex flex-col items-center text-center flex-1 px-4" style={{ zIndex: 1 }}>
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
                  directorCount != null ? `${directorCount.toLocaleString()} funeral directors listed` : '208+ funeral directors listed',
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

        {/* ── Map ── */}
        {showMap && !loading && filteredResults.length > 0 && (
          <div className="mb-6 rounded-2xl overflow-hidden border border-warm-border shadow-sm" style={{ height: '380px' }}>
            <Suspense fallback={
              <div className="h-full bg-cream flex items-center justify-center">
                <div className="w-7 h-7 rounded-full border-2 border-sage animate-spin" style={{ borderTopColor: 'transparent' }} />
              </div>
            }>
              <DirectorsMap
                directors={filteredResults}
                userCoords={userCoords}
                radiusMiles={maxDistance}
                onView={id => navigate(`/director/${id}`, { state: { from: `/search?location=${encodeURIComponent(location)}` } })}
              />
            </Suspense>
          </div>
        )}

        {!loading && !fetchError && location && resultCount === 0 && (
          <EmptyState location={location} isProximity={isProximity} />
        )}

        {!loading && !fetchError && resultCount > 0 && filteredResults.length === 0 && (
          <div className="flex flex-col items-center text-center py-16 px-4">
            <p className="text-charcoal font-semibold mb-1">No directors match your filters</p>
            <p className="text-muted text-sm mb-4">Try widening your filters or removing some criteria.</p>
            <button onClick={clearFilters} className="px-4 py-2 bg-sage text-white text-sm font-semibold rounded-xl hover:bg-sage-dark transition-colors">
              Clear all filters
            </button>
          </div>
        )}

        {/* ── Results ── */}
        {!loading && !fetchError && filteredResults.length > 0 && (() => {
          const sortFn = (a, b) => {
            if (sortBy === 'attended')  return (a.attended_price  ?? 999999) - (b.attended_price  ?? 999999)
            if (sortBy === 'cremation') return (a.cremation_price ?? 999999) - (b.cremation_price ?? 999999)
            return (a._miles ?? 999) - (b._miles ?? 999)
          }
          const featured = [...filteredResults.filter(r => r.is_featured)].sort(sortFn)
          const regular  = filteredResults.filter(r => !r.is_featured)
          const sorted   = [...regular].sort(sortFn)
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

      {/* ── City links ── */}
      <div className="border-t border-warm-border bg-cream">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-10">
          <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-5">Find funeral directors by city</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(CITIES).map(([slug, { name }]) => (
              <div key={slug}>
                <p className="text-sm font-semibold text-charcoal mb-1">{name}</p>
                <Link to={`/funeral-directors/${slug}`} className="block text-xs text-muted hover:text-charcoal transition-colors leading-relaxed">
                  Funeral directors
                </Link>
                <Link to={`/direct-cremation/${slug}`} className="block text-xs text-muted hover:text-charcoal transition-colors leading-relaxed">
                  Direct cremation
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
