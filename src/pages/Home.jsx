import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const CHECK_ICON = (
  <svg className="w-4 h-4 text-sage shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
)
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const FAQS = [
  {
    q: 'How much does a funeral cost in the UK?',
    a: 'The average attended funeral in the UK costs around £4,400. A direct cremation (no service, no hearse) typically costs between £700 and £1,800. Burial funerals average around £5,700, not including the headstone. Prices vary significantly between funeral directors in the same area — comparing is worth it.',
  },
  {
    q: 'What is direct cremation?',
    a: 'Direct cremation is a simple cremation with no funeral service or ceremony at the crematorium. The body is collected, cremated, and the ashes returned to the family. It\'s the most affordable option and is chosen by around 1 in 5 families in the UK. Many hold a separate memorial or celebration of life in their own time.',
  },
  {
    q: 'Do I have to use a local funeral director?',
    a: 'No. You can use any funeral director you choose — they don\'t have to be the nearest one. That said, a local director has practical advantages: they know local crematoria, and if you want a viewing, visiting is easier. For direct cremation, location matters less.',
  },
  {
    q: 'What is included in the funeral director\'s price?',
    a: 'A typical price covers: collecting the deceased, a coffin, preparation, use of chapel of rest, a hearse, and the director\'s professional fee. It usually does not include the cremation or burial fee, celebrant, flowers, or transport for family. Always ask for a total estimated cost, including all third-party fees.',
  },
  {
    q: 'Can I get help paying for a funeral?',
    a: 'Yes. If you receive Universal Credit, Pension Credit, ESA, JSA, Income Support, or Child Tax Credit, you may qualify for a Funeral Expenses Payment from the government. It covers cremation or burial fees in full, plus up to £1,000 towards other costs.',
    link: { label: 'See our government grants guide', to: '/government-grants' },
  },
  {
    q: 'How does FuneralFair make money?',
    a: 'Funeral directors can pay to be listed as a Featured Partner — placed in a clearly labelled section above standard results. That\'s it. Standard results are sorted by distance or price, never by payment. We never take commission when you contact a director.',
  },
]

function FaqItem({ q, a, link }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-warm-border last:border-0">
      <button
        className="w-full flex items-start justify-between gap-4 py-5 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <span className="font-semibold text-charcoal text-sm sm:text-base leading-snug">{q}</span>
        <svg
          className={`w-5 h-5 text-muted shrink-0 mt-0.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div
        className={`grid transition-all duration-200 ease-in-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="pb-5">
            <p className="text-sm text-muted leading-relaxed">{a}</p>
            {link && (
              <Link to={link.to} className="inline-block mt-3 text-sm text-sage underline underline-offset-2 hover:text-sage-dark">
                {link.label} →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

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
    desc: 'See attended funerals and direct cremations clearly laid out — real prices from local directors.',
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
    document.title = 'FuneralFair — Compare Funeral Prices Near You'
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'Compare funeral directors near you with real, published prices. No commission, no account needed — find fair funeral costs in your area.')
  }, [])

  useEffect(() => {
    fetch('/api/director-count')
      .then(r => r.json())
      .then(data => { if (data.count != null) setDirectorCount(data.count) })
      .catch(() => {})
  }, [])

  const trustSignals = [
    { stat: directorCount != null ? `${directorCount}` : '…', label: 'funeral directors listed' },
    { stat: 'No commission', label: 'ever — results are independent' },
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
            Real prices from local funeral directors.<br className="hidden sm:block" />
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

      {/* ── FAQ ── */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 bg-white border-t border-warm-border">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal mb-3">Common questions</h2>
          </div>
          <div className="bg-cream rounded-2xl border border-warm-border px-5 sm:px-8">
            {FAQS.map(({ q, a, link }) => (
              <FaqItem key={q} q={q} a={a} link={link} />
            ))}
          </div>
        </div>
      </section>

      {/* ── For funeral directors ── */}
      <section className="px-4 sm:px-6 py-14 sm:py-16 bg-sage-light border-t border-sage-border">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl border border-sage-border shadow-sm overflow-hidden">
            <div className="grid lg:grid-cols-[1fr_300px]">

              {/* Left: copy */}
              <div className="px-8 sm:px-10 py-10 border-b lg:border-b-0 lg:border-r border-sage-border">
                <p className="text-xs font-semibold tracking-widest uppercase text-sage mb-3">For funeral directors</p>
                <h2 className="text-2xl font-bold text-charcoal mb-3 leading-snug">
                  List your business for free.
                </h2>
                <p className="text-muted text-sm leading-relaxed mb-6">
                  FuneralFair is free to appear on — always. Unlike paid directories that charge a listing fee just to show up in results, we never charge for a standard listing. Families find you based on location and price, not on who paid the most.
                </p>
                <ul className="flex flex-col gap-3">
                  {[
                    'Free standard listing — no monthly fee, ever',
                    'Families contact you directly — we take no commission',
                    'Results ranked by proximity and price, not payment',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-charcoal">
                      {CHECK_ICON}
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: CTA */}
              <div className="px-8 py-10 bg-sage-light flex flex-col justify-center gap-5">
                <div>
                  <p className="text-base font-bold text-charcoal mb-1.5">Ready to get started?</p>
                  <p className="text-sm text-muted leading-relaxed">
                    Already listed? Claim your listing to verify your details and show families you're active.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Link
                    to="/for-funeral-directors"
                    className="w-full text-center py-3 bg-sage hover:bg-sage-dark text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
                  >
                    List your business free →
                  </Link>
                  <Link
                    to="/for-funeral-directors"
                    className="w-full text-center py-3 border border-sage-border bg-white hover:bg-cream text-charcoal font-semibold rounded-xl text-sm transition-colors"
                  >
                    Claim your listing
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
