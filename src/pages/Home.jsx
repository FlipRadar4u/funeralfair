import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const STEPS = [
  {
    icon: (
      <svg className="w-6 h-6 text-sage" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />
      </svg>
    ),
    title: 'Enter your postcode',
    desc: "Type your postcode or town and we'll find funeral directors near you.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-sage" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Compare prices side by side',
    desc: 'See attended funerals and direct cremations clearly laid out — all from legally required price lists.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-sage" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    title: 'Choose with confidence',
    desc: 'No pressure, no commission, no account needed. Just honest information when you need it most.',
  },
]

function CheckIcon() {
  return (
    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sage shrink-0">
      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
  )
}

export default function Home() {
  const [location, setLocation] = useState('')
  const [directorCount, setDirectorCount] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/directors')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setDirectorCount(data.length) })
      .catch(() => {})
  }, [])

  const trustSignals = [
    { stat: directorCount != null ? `${directorCount}` : '…', label: 'funeral directors listed' },
    { stat: 'Trusted by', label: 'families across the UK' },
    { stat: '100% free', label: 'to use, always' },
  ]

  function handleSearch(e) {
    e.preventDefault()
    const q = location.trim()
    if (q) navigate(`/search?location=${encodeURIComponent(q)}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative isolate flex flex-col items-center text-center px-5 sm:px-6 pt-14 pb-14 sm:pt-28 sm:pb-28 overflow-hidden">

        {/* Background decoration — isolate creates stacking context so -z-10 stays inside section */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {/* Primary sage glow behind the headline */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-sage opacity-[0.18] blur-3xl" />
          {/* Secondary accent bottom-right */}
          <div className="absolute -bottom-10 -right-16 w-96 h-96 rounded-full bg-sage opacity-[0.10] blur-3xl" />
          {/* Subtle dot grid texture */}
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{ backgroundImage: 'radial-gradient(circle, #7a9e7e 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />
        </div>

        <span className="inline-flex items-center gap-1.5 mb-6 px-3 py-1 rounded-full bg-sage-light border border-sage-border text-sage text-xs font-semibold tracking-widest uppercase">
          UK funeral price comparison
        </span>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal leading-tight max-w-2xl mb-6">
          Find a funeral director you can trust.
        </h1>

        <p className="text-lg sm:text-xl text-muted max-w-xl mb-10 leading-relaxed">
          We know you didn't choose to be here. Compare honest prices from local funeral directors, free and without pressure.
        </p>

        {/* Search form */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 w-full max-w-lg mb-4">
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Enter your postcode or town…"
            className="flex-1 px-4 py-3.5 rounded-xl border border-warm-border bg-white text-charcoal placeholder-muted text-base focus:outline-none focus:ring-2 focus:ring-sage shadow-sm"
          />
          <button
            type="submit"
            className="px-7 py-3.5 bg-sage hover:bg-sage-dark text-white font-semibold rounded-xl transition-colors duration-150 shadow-sm text-base whitespace-nowrap"
          >
            Find local directors
          </button>
        </form>

        {/* No friction reassurance */}
        <p className="text-sm text-muted mb-12 flex items-center justify-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5"><CheckIcon />No account needed</span>
          <span className="flex items-center gap-1.5"><CheckIcon />Completely free</span>
          <span className="flex items-center gap-1.5"><CheckIcon />No sales calls</span>
        </p>

        {/* Trust signals — always 3 columns so it never stacks tall on mobile */}
        <div className="grid grid-cols-3 divide-x divide-warm-border border border-warm-border rounded-2xl overflow-hidden bg-white/70 backdrop-blur-sm shadow-sm w-full max-w-lg">
          {trustSignals.map(({ stat, label }) => (
            <div key={stat} className="px-3 py-3.5 text-center">
              <p className="text-base sm:text-lg font-bold text-charcoal leading-none mb-1">{stat}</p>
              <p className="text-xs text-muted leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="border-t border-warm-border" />

      {/* ── How it works ── */}
      <section className="px-4 sm:px-6 py-20 sm:py-24 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-3">How it works</h2>
            <p className="text-muted text-lg max-w-md mx-auto">
              Simple and straightforward &mdash; just like it should be.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center px-4">
                <div className="w-14 h-14 rounded-2xl bg-sage-light border border-sage-border flex items-center justify-center mb-5">
                  {icon}
                </div>
                <h3 className="font-semibold text-charcoal text-lg mb-2">{title}</h3>
                <p className="text-muted text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom search ── */}
      <section className="px-4 sm:px-6 py-16 bg-cream">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-sage mb-4">Free &amp; impartial</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal mb-3">
            Compare funeral directors near you
          </h2>
          <p className="text-muted mb-8 text-base leading-relaxed">
            Prices from legally required Standardised Price Lists.<br className="hidden sm:block" />
            No account. No sales calls. No pressure.
          </p>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 w-full max-w-lg mx-auto">
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Enter your postcode or town…"
              className="flex-1 px-4 py-3.5 rounded-xl border border-warm-border bg-white text-charcoal placeholder-muted text-base focus:outline-none focus:ring-2 focus:ring-sage shadow-sm"
            />
            <button
              type="submit"
              className="px-7 py-3.5 bg-sage hover:bg-sage-dark text-white font-semibold rounded-xl transition-colors duration-150 shadow-sm text-base whitespace-nowrap"
            >
              Compare prices
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  )
}
