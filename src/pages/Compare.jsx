import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setPageMeta } from '../utils/setPageMeta'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCompare } from '../context/CompareContext'

function fmt(val) {
  if (val == null) return '—'
  const n = Number(val)
  return isNaN(n) ? '—' : `£${n.toLocaleString('en-GB')}`
}

const ROWS = [
  { label: 'Attended funeral',  key: 'attended_price',  type: 'price' },
  { label: 'Direct cremation',  key: 'cremation_price', type: 'price' },
  { label: 'Town',              key: 'town',            type: 'text' },
  { label: 'NAFD member',       key: 'nafd_member',     type: 'bool' },
  { label: 'SAIF member',       key: 'saif_member',     type: 'bool' },
]

function Cell({ row, director }) {
  const val = director[row.key]
  if (row.type === 'bool') {
    return (
      <span className={`text-sm font-semibold ${val ? 'text-sage' : 'text-muted'}`}>
        {val ? '✓ Yes' : '—'}
      </span>
    )
  }
  if (row.type === 'price') {
    const display = fmt(val)
    const isLowest = display !== '—'
    return (
      <span className={`text-sm font-bold ${isLowest ? 'text-charcoal' : 'text-muted'}`}>
        {display}
      </span>
    )
  }
  return <span className="text-sm text-charcoal">{val || '—'}</span>
}

export default function Compare() {
  const { list, remove, clear } = useCompare()
  const navigate = useNavigate()

  useEffect(() => {
    setPageMeta({
      title: 'Compare Funeral Directors | FuneralFair',
      description: 'Compare funeral directors side by side — prices, ratings, and contact details. Free and impartial.',
      path: '/compare',
    })
  }, [])

  if (list.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-sage-light border border-sage-border flex items-center justify-center mb-5">
            <svg className="w-7 h-7 text-sage" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75zM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-charcoal mb-3">Nothing to compare yet</h1>
          <p className="text-muted text-sm mb-6 max-w-xs leading-relaxed">
            Search for funeral directors and tap "Compare" on any card to add them here.
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-6 py-3 bg-sage text-white font-semibold rounded-xl hover:bg-sage-dark text-sm"
          >
            Find directors →
          </button>
        </main>
        <Footer />
      </div>
    )
  }

  // Find cheapest per price column for highlighting
  const lowestAttended  = Math.min(...list.map(d => d.attended_price  ?? Infinity).filter(v => v !== Infinity))
  const lowestCremation = Math.min(...list.map(d => d.cremation_price ?? Infinity).filter(v => v !== Infinity))

  const cols = list.length

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">

        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-xl sm:text-3xl font-bold text-charcoal leading-tight">
            Compare funeral directors
          </h1>
          <button onClick={clear} className="text-sm text-muted hover:text-charcoal underline shrink-0">
            Clear all
          </button>
        </div>

        {/* Mobile: stacked cards */}
        <div className="sm:hidden space-y-4 mb-8">
          {list.map(d => (
            <div key={d.id} className="bg-white rounded-2xl border border-warm-border shadow-sm overflow-hidden">
              {/* Card header */}
              <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-warm-border">
                <div className="min-w-0">
                  <p className="font-semibold text-charcoal leading-snug">{d.name}</p>
                  <p className="text-sm text-muted mt-0.5">{d.town}</p>
                  {(d.nafd_member || d.saif_member) && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {d.nafd_member && <span className="text-xs bg-sage-light text-sage border border-sage-border rounded-full px-2.5 py-0.5 font-semibold">NAFD</span>}
                      {d.saif_member && <span className="text-xs bg-sage-light text-sage border border-sage-border rounded-full px-2.5 py-0.5 font-semibold">SAIF</span>}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => remove(d.id)}
                  className="text-xs text-muted hover:text-red-500 underline shrink-0 ml-3 pt-0.5"
                  style={{ touchAction: 'manipulation' }}
                >
                  Remove
                </button>
              </div>
              {/* Prices */}
              <div className="grid grid-cols-2 divide-x divide-warm-border">
                <div className="px-4 py-4 text-center">
                  <p className="text-xs text-muted mb-1.5 leading-tight">Attended funeral</p>
                  <p className={`text-xl font-bold tabular-nums ${d.attended_price != null && d.attended_price === lowestAttended ? 'text-sage' : 'text-charcoal'}`}>
                    {fmt(d.attended_price)}
                  </p>
                  {d.attended_price != null && d.attended_price === lowestAttended && (
                    <span className="block text-xs font-semibold text-sage mt-0.5">Lowest</span>
                  )}
                </div>
                <div className="px-4 py-4 text-center">
                  <p className="text-xs text-muted mb-1.5 leading-tight">Direct cremation</p>
                  <p className={`text-xl font-bold tabular-nums ${d.cremation_price != null && d.cremation_price === lowestCremation ? 'text-sage' : 'text-charcoal'}`}>
                    {fmt(d.cremation_price)}
                  </p>
                  {d.cremation_price != null && d.cremation_price === lowestCremation && (
                    <span className="block text-xs font-semibold text-sage mt-0.5">Lowest</span>
                  )}
                </div>
              </div>
              {/* CTA */}
              <div className="px-5 py-4 border-t border-warm-border">
                <Link
                  to={`/director/${d.id}`}
                  className="block w-full py-3 bg-sage hover:bg-sage-dark active:bg-sage-dark text-white text-sm font-semibold rounded-xl text-center transition-colors"
                  style={{ touchAction: 'manipulation' }}
                >
                  View full details →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: table */}
        <div className="hidden sm:block bg-white rounded-2xl border border-warm-border overflow-hidden shadow-sm mb-6">

          {/* Header row */}
          <div
            className="grid border-b border-warm-border"
            style={{ gridTemplateColumns: `200px repeat(${cols}, 1fr)` }}
          >
            <div className="px-5 py-4 bg-cream/70" />
            {list.map(d => (
              <div key={d.id} className="px-5 py-4 border-l border-warm-border">
                <p className="font-semibold text-charcoal text-sm leading-snug">{d.name}</p>
                <p className="text-xs text-muted mt-0.5">{d.town}</p>
                <button
                  onClick={() => remove(d.id)}
                  className="text-xs text-muted hover:text-red-500 mt-2 underline underline-offset-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Data rows */}
          {ROWS.map((row, i) => (
            <div
              key={row.key}
              className={`grid border-b border-warm-border ${i % 2 === 1 ? 'bg-cream/40' : ''}`}
              style={{ gridTemplateColumns: `200px repeat(${cols}, 1fr)` }}
            >
              <div className="px-5 py-4 flex items-center">
                <span className="text-xs font-semibold text-muted uppercase tracking-wide">{row.label}</span>
              </div>
              {list.map(d => {
                const val = d[row.key]
                const isLowest =
                  (row.key === 'attended_price'  && val === lowestAttended  && val != null) ||
                  (row.key === 'cremation_price' && val === lowestCremation && val != null)
                return (
                  <div key={d.id} className="px-5 py-4 border-l border-warm-border flex items-center gap-2">
                    <Cell row={row} director={d} />
                    {isLowest && (
                      <span className="text-xs bg-sage text-white rounded-full px-2 py-0.5 font-semibold">
                        Lowest
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}

          {/* View details row */}
          <div
            className="grid"
            style={{ gridTemplateColumns: `200px repeat(${cols}, 1fr)` }}
          >
            <div className="px-5 py-4 bg-cream/70" />
            {list.map(d => (
              <div key={d.id} className="px-5 py-4 border-l border-warm-border">
                <Link
                  to={`/director/${d.id}`}
                  className="block w-full py-2.5 bg-sage hover:bg-sage-dark text-white text-xs font-semibold rounded-xl text-center transition-colors"
                >
                  View full details →
                </Link>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted text-center leading-relaxed">
          Prices are sourced from published Standardised Price Lists. Verify final costs with the director before booking.{' '}
          <Link to="/how-we-rank" className="underline underline-offset-2 hover:text-sage">How we rank results</Link>
        </p>
      </main>
      <Footer />
    </div>
  )
}
