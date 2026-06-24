import { useEffect, useState } from 'react'
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom'
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

// ── Formatting ────────────────────────────────────────────────────────────────

function formatPrice(val) {
  if (val == null) return '—'
  const n = Number(val)
  return isNaN(n) ? '—' : `£${n.toLocaleString('en-GB')}`
}

// ── Director card ─────────────────────────────────────────────────────────────

function DirectorCard({ director, city }) {
  const navigate  = useNavigate()
  const backUrl   = `/funeral-directors/${city}`
  const attended  = formatPrice(director.attended_price)
  const cremation = formatPrice(director.cremation_price)
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
          {director.photos?.[0] && (
            <img
              src={director.photos[0]}
              alt=""
              className="w-14 h-14 rounded-xl object-cover border border-warm-border shadow-sm mb-0.5"
            />
          )}
          {director.claimed_at && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sage text-white">
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Listing verified
            </span>
          )}
          {director.is_featured && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sage-light border border-sage-border text-sage">
              Featured
            </span>
          )}
          {director.nafd_member && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sage-light border border-sage-border text-sage">
              NAFD
            </span>
          )}
          {director.saif_member && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sage-light border border-sage-border text-sage">
              SAIF
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col items-center justify-center bg-cream border border-warm-border rounded-xl px-3 py-3 text-center">
          <span className="text-xs text-muted font-medium mb-1 leading-tight">Attended funeral</span>
          <span className="text-lg font-bold text-charcoal tabular-nums">{attended}</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-cream border border-warm-border rounded-xl px-3 py-3 text-center">
          <span className="text-xs text-muted font-medium mb-1 leading-tight">Direct cremation</span>
          <span className="text-lg font-bold text-charcoal tabular-nums">{cremation}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-auto">
        <button
          onClick={e => { e.stopPropagation(); navigate(`/director/${director.id}`, { state: { from: backUrl } }) }}
          className="flex-1 py-2.5 rounded-xl bg-sage text-white font-semibold text-sm hover:bg-sage-dark"
        >
          View listing →
        </button>
        <button
          onClick={e => { e.stopPropagation(); inCompare ? remove(director.id) : add(director) }}
          disabled={listFull}
          title={listFull ? 'Max 3 in compare' : inCompare ? 'Remove from compare' : 'Add to compare'}
          className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
            inCompare ? 'bg-sage-light border-sage text-sage'
            : listFull ? 'border-warm-border text-muted/40 cursor-not-allowed'
            : 'border-warm-border text-muted hover:border-sage hover:text-sage'
          }`}
        >
          {inCompare ? '✓ Added' : 'Compare'}
        </button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CityPage() {
  const { city }   = useParams()
  const cityData   = CITIES[city]
  const navigate   = useNavigate()
  const [inputValue, setInputValue] = useState('')

  const [directors, setDirectors] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [sortBy,      setSortBy]      = useState('distance')
  const [filterNafd,  setFilterNafd]  = useState(false)
  const [filterSaif,  setFilterSaif]  = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    if (!cityData) return
    document.title = `Funeral Directors in ${cityData.name} | FuneralFair`
    document.querySelector('meta[name="description"]')?.setAttribute('content', `Find and compare funeral directors in ${cityData.name}. Real prices from local providers — attended funerals and direct cremation. No commission.`)

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/directors?lat=${cityData.lat}&lng=${cityData.lng}&radius=${cityData.radius}`)
        if (!res.ok) throw new Error(`${res.status}`)
        const all = await res.json()
        if (cancelled) return

        const withDist = all
          .filter(d => d.lat != null && d.lng != null)
          .map(d => ({ ...d, _miles: haversineMiles(cityData.lat, cityData.lng, d.lat, d.lng) }))
          .filter(d => d._miles <= cityData.radius)
          .sort((a, b) => {
            if (b.is_featured !== a.is_featured) return b.is_featured ? 1 : -1
            return a._miles - b._miles
          })

        setDirectors(withDist)
      } catch (e) {
        if (!cancelled) setError('Could not load directors. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [city, cityData])

  // Inject FAQ schema after data loads
  useEffect(() => {
    if (loading || !cityData || directors.length === 0) return

    const attendedPrices  = directors.map(d => d.attended_price).filter(p => p != null && p > 0)
    const cremationPrices = directors.map(d => d.cremation_price).filter(p => p != null && p > 0)
    const avg = arr => arr.length >= 3 ? Math.round(arr.reduce((s, p) => s + p, 0) / arr.length) : null
    const avgA = avg(attendedPrices)
    const avgC = avg(cremationPrices)

    const faqs = [
      {
        q: `How much does a funeral cost in ${cityData.name}?`,
        a: avgA
          ? `The average attended funeral in ${cityData.name} costs around £${avgA.toLocaleString('en-GB')}, based on published prices from local funeral directors. Costs vary between providers — comparing is worth it.`
          : `Funeral costs in ${cityData.name} vary between providers. Use FuneralFair to compare real, published prices from local funeral directors near you.`,
      },
      {
        q: `How much does direct cremation cost in ${cityData.name}?`,
        a: avgC
          ? `The average direct cremation in ${cityData.name} costs around £${avgC.toLocaleString('en-GB')}. Direct cremation is the most affordable option — no service at the crematorium, with the ashes returned to the family.`
          : `Direct cremation is typically the most affordable funeral option in ${cityData.name}. It involves no formal service at the crematorium, with ashes returned to the family.`,
      },
      {
        q: `How many funeral directors are there in ${cityData.name}?`,
        a: `There are ${directors.length} funeral directors listed near ${cityData.name} on FuneralFair. You can compare their prices side by side to find the right fit.`,
      },
      {
        q: `How do I choose a funeral director in ${cityData.name}?`,
        a: `Compare prices, check whether they hold NAFD or SAIF membership (both require members to follow strict codes of practice), and read Google reviews. FuneralFair shows real published prices from ${cityData.name} funeral directors so you can make an informed decision without pressure.`,
      },
    ]

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    }

    let el = document.getElementById('city-faq-schema')
    if (!el) {
      el = document.createElement('script')
      el.id   = 'city-faq-schema'
      el.type = 'application/ld+json'
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(schema)

    return () => { document.getElementById('city-faq-schema')?.remove() }
  }, [loading, directors, cityData])

  // BreadcrumbList schema
  useEffect(() => {
    if (!cityData) return
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://funeralfair.co.uk' },
        { '@type': 'ListItem', position: 2, name: `Funeral Directors in ${cityData.name}`, item: `https://funeralfair.co.uk/funeral-directors/${city}` },
      ],
    }
    let el = document.getElementById('city-breadcrumb-schema')
    if (!el) { el = document.createElement('script'); el.id = 'city-breadcrumb-schema'; el.type = 'application/ld+json'; document.head.appendChild(el) }
    el.textContent = JSON.stringify(schema)
    return () => { document.getElementById('city-breadcrumb-schema')?.remove() }
  }, [cityData, city])

  if (!cityData) return <Navigate to="/" replace />

  const filtered = directors.filter(d => {
    if (filterNafd && !d.nafd_member) return false
    if (filterSaif && !d.saif_member) return false
    return true
  })

  const activeFilterCount = [filterNafd, filterSaif].filter(Boolean).length
  function clearFilters() { setFilterNafd(false); setFilterSaif(false) }

  const sortFn = (a, b) => {
    const priceField = sortBy === 'attended' ? 'attended_price'
                     : sortBy === 'cremation' ? 'cremation_price'
                     : null
    if (priceField) {
      const aHas = a[priceField] != null ? 0 : 1
      const bHas = b[priceField] != null ? 0 : 1
      if (aHas !== bHas) return aHas - bHas
    } else {
      const aHas = (a.attended_price != null || a.cremation_price != null) ? 0 : 1
      const bHas = (b.attended_price != null || b.cremation_price != null) ? 0 : 1
      if (aHas !== bHas) return aHas - bHas
    }
    if (sortBy === 'attended')  return (a.attended_price  ?? 999999) - (b.attended_price  ?? 999999)
    if (sortBy === 'cremation') return (a.cremation_price ?? 999999) - (b.cremation_price ?? 999999)
    return (a._miles ?? 999) - (b._miles ?? 999)
  }

  const featured = [...filtered.filter(d => d.is_featured)].sort(sortFn)
  const others   = [...filtered.filter(d => !d.is_featured)].sort(sortFn)

  const attendedPrices  = directors.map(d => d.attended_price).filter(p => p != null && p > 0)
  const cremationPrices = directors.map(d => d.cremation_price).filter(p => p != null && p > 0)
  const avgAttended  = attendedPrices.length  >= 3 ? Math.round(attendedPrices.reduce((s, p)  => s + p, 0) / attendedPrices.length)  : null
  const avgCremation = cremationPrices.length >= 3 ? Math.round(cremationPrices.reduce((s, p) => s + p, 0) / cremationPrices.length) : null

  const nearbyCities = cityData
    ? Object.entries(CITIES)
        .filter(([slug]) => slug !== city)
        .map(([slug, data]) => ({ slug, name: data.name, miles: haversineMiles(cityData.lat, cityData.lng, data.lat, data.lng) }))
        .sort((a, b) => a.miles - b.miles)
        .slice(0, 6)
    : []

  function handleSearch(e) {
    e.preventDefault()
    const q = inputValue.trim()
    if (q) navigate(`/search?location=${encodeURIComponent(q)}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      {/* ── City image banner ── */}
      <div className="relative w-full overflow-hidden bg-charcoal" style={{ height: '200px' }}>
        <img
          src="/city-hero.jpg"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 40%' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.65))' }} />
        <div className="absolute inset-0 flex flex-col justify-end pb-5 px-5 sm:px-8" style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
            Funeral Directors in {cityData.name}
          </h1>
          {!loading && directors.length > 0 && (
            <p className="text-white/75 text-sm mt-1">
              {directors.length} director{directors.length !== 1 ? 's' : ''} listed · Real published prices, no commission
            </p>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-5 sm:px-6 py-8 sm:py-10">

        {/* ── City stats ── */}
        {!loading && directors.length > 0 && (
          <div className="grid grid-cols-3 divide-x divide-warm-border border border-warm-border rounded-2xl overflow-hidden bg-white shadow-sm mb-8">
            <div className="px-3 py-4 text-center">
              <p className="text-xl font-bold text-charcoal">{directors.length}</p>
              <p className="text-xs text-muted mt-0.5 leading-tight">Directors</p>
            </div>
            <div className="px-3 py-4 text-center">
              <p className="text-xl font-bold text-charcoal">{avgAttended ? `£${avgAttended.toLocaleString('en-GB')}` : '—'}</p>
              <p className="text-xs text-muted mt-0.5 leading-tight">Avg. attended</p>
            </div>
            <div className="px-3 py-4 text-center">
              <p className="text-xl font-bold text-charcoal">{avgCremation ? `£${avgCremation.toLocaleString('en-GB')}` : '—'}</p>
              <p className="text-xs text-muted mt-0.5 leading-tight">Avg. cremation</p>
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

        {/* ── Sort / filter bar ── */}
        {!loading && directors.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFiltersOpen(o => !o)}
                style={{ touchAction: 'manipulation' }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-colors ${filtersOpen || activeFilterCount > 0 ? 'bg-sage text-white border-sage' : 'bg-white text-muted border-warm-border hover:border-sage hover:text-charcoal'}`}
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3z" />
                </svg>
                Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </button>
              <button
                onClick={() => setSortBy('distance')}
                style={{ touchAction: 'manipulation' }}
                className={`shrink-0 px-3 py-2 rounded-full text-xs font-semibold border transition-colors ${sortBy === 'distance' ? 'bg-sage text-white border-sage' : 'bg-white text-muted border-warm-border hover:border-sage hover:text-charcoal'}`}
              >Nearest first</button>
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

            {filtersOpen && (
              <div className="mt-3 bg-white border border-warm-border rounded-2xl p-5">
                <p className="text-xs font-semibold text-charcoal mb-2">Membership</p>
                <div className="flex flex-wrap gap-2">
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
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="mt-4 text-xs text-sage font-medium hover:underline">
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-sage border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <p className="text-center text-muted py-16">{error}</p>
        )}

        {/* ── Results ── */}
        {!loading && !error && (featured.length > 0 || others.length > 0) && (
          <div className="flex flex-col gap-10">

            {/* Featured */}
            {featured.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
                  Featured directors
                </h2>
                <div className="flex flex-col gap-4">
                  {featured.map(d => <DirectorCard key={d.id} director={d} city={city} />)}
                </div>
              </section>
            )}

            {/* All others */}
            {others.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
                  {featured.length > 0 ? 'All directors' : `Funeral directors in ${cityData.name}`}
                </h2>
                <div className="flex flex-col gap-4">
                  {others.map(d => <DirectorCard key={d.id} director={d} city={city} />)}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ── No results after filtering ── */}
        {!loading && !error && directors.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center text-center py-16 px-4">
            <p className="text-charcoal font-semibold mb-1">No directors match your filters</p>
            <p className="text-muted text-sm mb-4">Try removing some filters to see more results.</p>
            <button onClick={clearFilters} className="px-4 py-2 bg-sage text-white text-sm font-semibold rounded-xl hover:bg-sage-dark transition-colors">
              Clear all filters
            </button>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && directors.length === 0 && (
          <div className="flex flex-col items-center text-center py-20 px-4">
            <div className="w-16 h-16 rounded-full bg-sage-light flex items-center justify-center mb-5">
              <svg className="w-7 h-7 text-sage" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />
              </svg>
            </div>
            <p className="text-charcoal font-semibold text-lg mb-2">No directors found near {cityData.name}</p>
            <p className="text-muted text-sm max-w-xs leading-relaxed mb-6">
              We don't have any listed funeral directors in this area yet. Try searching a nearby postcode or town.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {nearbyCities.slice(0, 4).map(({ slug, name }) => (
                <Link key={slug} to={`/funeral-directors/${slug}`}
                  className="px-4 py-2 rounded-xl border border-warm-border bg-white text-sm text-charcoal hover:border-sage hover:text-sage transition-colors">
                  {name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Nearby areas ── */}
        {nearbyCities.length > 0 && (
          <section className="mt-12">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-widest mb-4">Also search nearby</h2>
            <div className="flex flex-wrap gap-2">
              {nearbyCities.map(({ slug, name }) => (
                <Link
                  key={slug}
                  to={`/funeral-directors/${slug}`}
                  className="px-4 py-2 rounded-xl border border-warm-border bg-white text-sm text-charcoal hover:border-sage hover:text-sage transition-colors"
                >
                  Funeral directors in {name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── FAQ ── */}
        {!loading && directors.length > 0 && (
          <section className="mt-16 border-t border-warm-border pt-10">
            <h2 className="text-xl font-bold text-charcoal mb-6">
              Common questions about funerals in {cityData.name}
            </h2>
            <div className="flex flex-col divide-y divide-warm-border">
              {[
                {
                  q: `How much does a funeral cost in ${cityData.name}?`,
                  a: avgAttended
                    ? `The average attended funeral in ${cityData.name} costs around £${avgAttended.toLocaleString('en-GB')}, based on published prices from local funeral directors. Costs vary between providers — comparing is worth it.`
                    : `Funeral costs in ${cityData.name} vary between providers. Use FuneralFair to compare real, published prices from local funeral directors near you.`,
                },
                {
                  q: `How much does direct cremation cost in ${cityData.name}?`,
                  a: avgCremation
                    ? `The average direct cremation in ${cityData.name} costs around £${avgCremation.toLocaleString('en-GB')}. Direct cremation is the most affordable option — no service at the crematorium, with the ashes returned to the family.`
                    : `Direct cremation is typically the most affordable funeral option in ${cityData.name}. It involves no formal service at the crematorium, with ashes returned to the family.`,
                },
                {
                  q: `How many funeral directors are there in ${cityData.name}?`,
                  a: `There are ${directors.length} funeral director${directors.length !== 1 ? 's' : ''} listed near ${cityData.name} on FuneralFair. You can compare their prices side by side to find the right fit.`,
                },
                {
                  q: `How do I choose a funeral director in ${cityData.name}?`,
                  a: `Compare prices, check whether they hold NAFD or SAIF membership (both require members to follow strict codes of practice), and read Google reviews. FuneralFair shows real published prices from ${cityData.name} funeral directors so you can make an informed decision without pressure.`,
                },
              ].map(({ q, a }) => (
                <div key={q} className="py-5">
                  <h3 className="text-sm font-semibold text-charcoal mb-1.5">{q}</h3>
                  <p className="text-sm text-muted leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  )
}
