import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 rounded-full border-2 border-sage animate-spin" style={{ borderTopColor: 'transparent' }} />
    </div>
  )
}

function PendingListings({ listings, pw, onRefresh }) {
  const [loading, setLoading] = useState({})

  const needsReview = listings.filter(l => l.needs_review)
  if (!needsReview.length) return (
    <p className="text-sm text-muted py-4 text-center">No listings awaiting review.</p>
  )

  async function act(directorId, approve) {
    setLoading(l => ({ ...l, [directorId]: true }))
    await fetch('/api/admin/approve-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pw, directorId, approve }),
    })
    setLoading(l => ({ ...l, [directorId]: false }))
    onRefresh()
  }

  return (
    <div className="flex flex-col gap-3">
      {needsReview.map(d => (
        <div key={d.id} className="bg-white rounded-2xl border border-amber-200 shadow-sm px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-charcoal">{d.name}</p>
              <p className="text-sm text-muted">{d.town}</p>
              <a href={d.website} target="_blank" rel="noopener noreferrer" className="text-sm text-sage hover:underline break-all">{d.website}</a>
              <p className="text-sm text-muted mt-1">Email: {d.director_email || '—'}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => act(d.id, true)}
                disabled={loading[d.id]}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-sage hover:bg-sage-dark text-white disabled:opacity-50 transition-colors"
              >
                {loading[d.id] ? '…' : 'Approve'}
              </button>
              <button
                onClick={() => act(d.id, false)}
                disabled={loading[d.id]}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 disabled:opacity-50 transition-colors"
              >
                {loading[d.id] ? '…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function PendingPhotos({ listings, pw, onRefresh }) {
  const [loading, setLoading] = useState({})

  const withPhotos = listings.filter(l => l.pending_photos?.length)
  if (!withPhotos.length) return (
    <p className="text-sm text-muted py-4 text-center">No photos awaiting approval.</p>
  )

  async function act(endpoint, directorId, photoUrl) {
    const key = `${directorId}:${photoUrl}`
    setLoading(l => ({ ...l, [key]: true }))
    await fetch(`/api/admin/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pw, directorId, photoUrl }),
    })
    setLoading(l => ({ ...l, [key]: false }))
    onRefresh()
  }

  return (
    <div className="flex flex-col gap-5">
      {withPhotos.map(d => (
        <div key={d.id} className="bg-white rounded-2xl border border-warm-border shadow-sm px-6 py-5">
          <p className="font-semibold text-charcoal mb-0.5">{d.name}</p>
          <p className="text-sm text-muted mb-4">{d.town}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {d.pending_photos.map(url => {
              const key     = `${d.id}:${url}`
              const busy    = loading[key]
              return (
                <div key={url} className="flex flex-col gap-2">
                  <div className="aspect-video rounded-xl overflow-hidden border border-warm-border">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => act('approve-photo', d.id, url)}
                      disabled={busy}
                      className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-sage hover:bg-sage-dark text-white disabled:opacity-50 transition-colors"
                    >
                      {busy ? '…' : 'Approve'}
                    </button>
                    <button
                      onClick={() => act('reject-photo', d.id, url)}
                      disabled={busy}
                      className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 disabled:opacity-50 transition-colors"
                    >
                      {busy ? '…' : 'Reject'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function FeaturedList({ listings }) {
  const active = listings.filter(l => l.is_featured && !l.needs_review)
  if (!active.length) return <p className="text-sm text-muted py-4 text-center">No active featured listings.</p>
  return (
    <div className="flex flex-col gap-3">
      {active.map(d => (
        <div key={d.id} className="bg-white rounded-2xl border border-warm-border shadow-sm px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="font-semibold text-charcoal">{d.name}</p>
            <p className="text-sm text-muted">{d.town} · {d.director_email || 'no email'}</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted shrink-0">
            <span>{d.photos?.length || 0} photos live</span>
            {d.pending_photos?.length ? <span className="text-amber-600 font-medium">{d.pending_photos.length} pending</span> : null}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AdminPanel() {
  const [pw, setPw]             = useState('')
  const [input, setInput]       = useState('')
  const [listings, setListings] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [tab, setTab]           = useState('review')

  async function login(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res  = await fetch(`/api/admin/listings?pw=${encodeURIComponent(input)}`)
    const data = await res.json()
    if (!res.ok) { setError('Incorrect password'); setLoading(false); return }
    setPw(input)
    setListings(data)
    setLoading(false)
  }

  async function refresh() {
    const res  = await fetch(`/api/admin/listings?pw=${encodeURIComponent(pw)}`)
    const data = await res.json()
    if (res.ok) setListings(data)
  }

  const tabs = [
    { id: 'review',  label: 'Needs review',    count: listings?.filter(l => l.needs_review).length },
    { id: 'photos',  label: 'Pending photos',  count: listings?.filter(l => l.pending_photos?.length).length },
    { id: 'active',  label: 'Active featured', count: listings?.filter(l => l.is_featured && !l.needs_review).length },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-2xl font-bold text-charcoal mb-8">Admin panel</h1>

        {!pw && (
          <form onSubmit={login} className="max-w-sm">
            <div className="flex flex-col gap-3">
              <input
                type="password"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Admin password"
                className="px-4 py-3 rounded-xl border border-warm-border bg-white text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-sage"
                required
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="py-3 bg-sage hover:bg-sage-dark text-white font-semibold rounded-xl text-sm disabled:opacity-60 transition-colors"
              >
                {loading ? 'Checking…' : 'Sign in'}
              </button>
            </div>
          </form>
        )}

        {pw && !listings && <Spinner />}

        {pw && listings && (
          <div className="flex flex-col gap-6">

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    tab === t.id
                      ? 'bg-charcoal text-white'
                      : 'bg-white border border-warm-border text-charcoal hover:border-sage'
                  }`}
                >
                  {t.label}
                  {t.count > 0 && (
                    <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-white/20' : 'bg-sage-light text-sage'}`}>
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {tab === 'review' && <PendingListings listings={listings} pw={pw} onRefresh={refresh} />}
            {tab === 'photos' && <PendingPhotos  listings={listings} pw={pw} onRefresh={refresh} />}
            {tab === 'active' && <FeaturedList   listings={listings} />}

          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
