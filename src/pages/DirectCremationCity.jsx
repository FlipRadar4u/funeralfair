import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCompare } from '../context/CompareContext'
import { CITIES } from '../data/cities'

// ── Geo helpers ───────────────────────────────────────────────────────────────

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

function formatPrice(val) {
  if (val == null) return null
  const n = Number(val)
  return isNaN(n) ? null : `£${n.toLocaleString('en-GB')}`
}

// ── Director card ─────────────────────────────────────────────────────────────

function DirectorCard({ director, city }) {
  const navigate = useNavigate()
  const backUrl  = `/direct-cremation/${city}`
  const price    = formatPrice(director.cremation_price)
  const { add, remove, isInList, list } = useCompare()
  const inCompare = isInList(director.id)
  const listFull  = list.length >= 3 && !inCompare

  return (
    <div
      className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-sm flex flex-col gap-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 ${director.is_featured ? 'border-sage ring-1 ring-sage' : 'border-warm-border'}`}
      onClick={() => navigate(`/director/${director.id}`, { state: { from: backUrl } })}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-semibold text-charcoal text-base leading-snug">{director.name}</h2>
          <p className="text-sm text-muted mt-0.5">{director.town}{director.postcode ? ` · ${director.postcode}` : ''}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {director.claimed_at && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sage text-white">
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Listing verified
            </span>
          )}
          {director.is_featured && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sage-light border border-sage-border text-sage">Featured</span>
          )}
          {director.nafd_member && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sage-light border border-sage-border text-sage">NAFD</span>
          )}
          {director.saif_member && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sage-light border border-sage-border text-sage">SAIF</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted mb-0.5">Direct cremation from</p>
          <p className="text-2xl font-bold text-charcoal tabular-nums">
            {price ?? <span className="text-base font-medium text-muted">Price on request</span>}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={e => { e.stopPropagation(); inCompare ? remove(director.id) : add(director) }}
            disabled={listFull}
            title={listFull ? 'Max 3 in compare' : inCompare ? 'Remove from compare' : 'Add to compare'}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              inCompare ? 'bg-sage-light border-sage text-sage'
              : listFull ? 'border-warm-border text-muted/40 cursor-not-allowed'
              : 'border-warm-border text-muted hover:border-sage hover:text-sage'
            }`}
          >
            {inCompare ? '✓' : 'Compare'}
          </button>
          <span className="text-sm font-semibold text-sage self-center">View listing →</span>
        </div>
      </div>

      {director.phone && (
        <p className="text-sm text-muted border-t border-warm-border pt-3">{director.phone}</p>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DirectCremationCity() {
  const { city }  = useParams()
  const cityData  = CITIES[city]
  const navigate  = useNavigate()
  const [inputValue, setInputValue] = useState('')

  const [directors, setDirectors] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    if (!cityData) return
    document.title = `Direct Cremation in ${cityData.name} — Compare Prices | FuneralFair`
    document.querySelector('meta[name="description"]')?.setAttribute('content', `Compare direct cremation prices in ${cityData.name}. Affordable, simple, dignified — prices from local funeral directors, no commission.`)

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/directors?lat=${cityData.lat}&lng=${cityData.lng}&radius=${cityData.radius}`)
        if (!res.ok) throw new Error(`${res.status}`)
        const all = await res.json()
        if (cancelled) return

        const nearby = all
          .filter(d => d.lat != null && d.lng != null)
          .map(d => ({ ...d, _miles: haversineMiles(cityData.lat, cityData.lng, d.lat, d.lng) }))
          .filter(d => d._miles <= cityData.radius)
          .sort((a, b) => {
            if (b.is_featured !== a.is_featured) return b.is_featured ? 1 : -1
            const aHasPrice = a.cremation_price != null
            const bHasPrice = b.cremation_price != null
            if (aHasPrice !== bHasPrice) return bHasPrice ? 1 : -1
            return (a.cremation_price ?? Infinity) - (b.cremation_price ?? Infinity)
          })

        setDirectors(nearby)
      } catch (e) {
        if (!cancelled) setError('Could not load directors. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [city, cityData])

  if (!cityData) return <Navigate to="/" replace />

  const featured = directors.filter(d => d.is_featured)
  const others   = directors.filter(d => !d.is_featured)

  const cremationPrices = directors.map(d => d.cremation_price).filter(p => p != null && p > 0)
  const lowestPrice  = cremationPrices.slice().sort((a, b) => a - b)[0] ?? null
  const avgCremation = cremationPrices.length >= 3
    ? Math.round(cremationPrices.reduce((s, p) => s + p, 0) / cremationPrices.length)
    : null

  function handleSearch(e) {
    e.preventDefault()
    const q = inputValue.trim()
    if (q) navigate(`/search?location=${encodeURIComponent(q)}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-5 sm:px-6 py-8 sm:py-14">

        {/* ── Hero ── */}
        <div className="mb-8">
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-light border border-sage-border text-sage text-xs font-semibold tracking-widest uppercase">
              Simple · Dignified · Affordable
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-charcoal mb-3">
            Direct Cremation in {cityData.name}
          </h1>
          {!loading && (
            <p className="text-muted text-base max-w-xl">
              {lowestPrice
                ? `Prices from £${lowestPrice.toLocaleString('en-GB')} · Compare ${directors.length} funeral director${directors.length !== 1 ? 's' : ''} near ${cityData.name}.`
                : `Compare ${directors.length} funeral director${directors.length !== 1 ? 's' : ''} offering direct cremation near ${cityData.name}.`}
            </p>
          )}
        </div>

        {/* ── What is direct cremation ── */}
        <div className="bg-white border border-warm-border rounded-2xl px-6 py-5 mb-8 text-sm text-charcoal leading-relaxed">
          <p className="font-semibold mb-1">What is direct cremation?</p>
          <p className="text-muted">
            Direct cremation is a simple, unattended cremation with no formal funeral service. The deceased is collected, cremated, and the ashes are returned to the family — who can then hold their own memorial in their own time. It's the most affordable option and is chosen by around 1 in 5 families in the UK.{' '}
            <Link to="/funeral-costs/uk#direct-cremation" className="text-sage hover:underline font-medium">Learn more →</Link>
          </p>
        </div>

        {/* ── City stats ── */}
        {!loading && directors.length > 0 && (
          <div className="grid grid-cols-3 divide-x divide-warm-border border border-warm-border rounded-2xl overflow-hidden bg-white shadow-sm mb-8">
            <div className="px-4 py-4 text-center">
              <p className="text-xl font-bold text-charcoal">{directors.length}</p>
              <p className="text-xs text-muted mt-0.5">providers near you</p>
            </div>
            <div className="px-4 py-4 text-center">
              <p className="text-xl font-bold text-charcoal">{lowestPrice ? `£${lowestPrice.toLocaleString('en-GB')}` : '—'}</p>
              <p className="text-xs text-muted mt-0.5">lowest price</p>
            </div>
            <div className="px-4 py-4 text-center">
              <p className="text-xl font-bold text-charcoal">{avgCremation ? `£${avgCremation.toLocaleString('en-GB')}` : '—'}</p>
              <p className="text-xs text-muted mt-0.5">avg. price nearby</p>
            </div>
          </div>
        )}

        {/* ── Search bar ── */}
        <form onSubmit={handleSearch} className="flex gap-2 sm:gap-3 mb-10">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Search a different postcode or town…"
            className="flex-1 px-4 py-3.5 rounded-xl border border-warm-border bg-white text-charcoal placeholder-muted text-base focus:outline-none focus:ring-2 focus:ring-sage shadow-sm"
          />
          <button
            type="submit"
            className="px-5 sm:px-7 py-3.5 bg-sage hover:bg-sage-dark text-white font-semibold rounded-xl shadow-sm text-sm sm:text-base whitespace-nowrap transition-colors duration-150"
          >
            Search
          </button>
        </form>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-sage border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && <p className="text-center text-muted py-16">{error}</p>}

        {/* ── Results ── */}
        {!loading && !error && directors.length > 0 && (
          <div className="flex flex-col gap-10">
            {featured.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">Featured directors</h2>
                <div className="flex flex-col gap-4">
                  {featured.map(d => <DirectorCard key={d.id} director={d} city={city} />)}
                </div>
              </section>
            )}
            {others.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
                  {featured.length > 0 ? 'All directors' : `Direct cremation in ${cityData.name}`}
                </h2>
                <div className="flex flex-col gap-4">
                  {others.map(d => <DirectorCard key={d.id} director={d} city={city} />)}
                </div>
              </section>
            )}
          </div>
        )}

        {!loading && !error && directors.length === 0 && (
          <div className="text-center py-24">
            <p className="text-charcoal font-semibold text-lg mb-2">No results found</p>
            <p className="text-muted text-sm">Try searching by postcode or town name above.</p>
          </div>
        )}

      </main>

      <Footer />
    </div>
  )
}
