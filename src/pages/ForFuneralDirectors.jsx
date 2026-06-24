import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { setPageMeta } from '../utils/setPageMeta'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const BENEFITS = [
  {
    icon: (
      <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
      </svg>
    ),
    title: 'Be seen by families actively searching',
    desc: 'People come to FuneralFair at the moment they need help most. Your listing puts you in front of them — no cold leads.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    ),
    title: 'Transparent pricing builds trust',
    desc: 'Families feel more confident contacting directors who are open about costs. Your pricing is already public — own it.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
      </svg>
    ),
    title: 'Keep your details up to date',
    desc: 'Claim your listing and you control your prices, contact details and photos — always accurate, always yours.',
  },
]

const TIERS = [
  {
    name: 'Free listing',
    price: '£0',
    period: 'forever',
    features: [
      'Listed in local search results',
      'Prices shown from your Standardised Price List',
      'Contact details displayed',
      'Claim & verify your listing',
      '1 photo',
    ],
    cta: 'Claim your free listing',
    highlight: false,
  },
  {
    name: 'Featured listing',
    price: '£49',
    period: 'per month',
    features: [
      'Everything in Free',
      'Pinned to the top of local search results',
      'Featured badge on your card',
      'Up to 10 photos',
      'Direct enquiry form',
      'Priority support',
    ],
    cta: 'Apply for Featured',
    highlight: true,
  },
]

function ApplicationPhotoUpload({ onUploaded }) {
  const [dragging,  setDragging]  = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState(null)
  const [preview,   setPreview]   = useState(null)
  const inputRef                  = useRef(null)

  async function upload(file) {
    if (!file) return
    setError(null); setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res  = await fetch('/api/upload-application-photo', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Upload failed'); return }
      setPreview(data.url)
      onUploaded(data.url)
    } catch { setError('Upload failed — please try again') }
    finally { setUploading(false) }
  }

  const onDrop = useCallback(e => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files[0]) }, [])

  if (preview) {
    return (
      <div className="flex items-center gap-4 p-3 rounded-xl border border-sage bg-sage-light/40">
        <img src={preview} alt="Preview" className="w-16 h-16 rounded-lg object-cover shrink-0 border border-warm-border" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-charcoal">Photo uploaded</p>
          <p className="text-xs text-muted mt-0.5">We'll add this to your listing once it's been reviewed.</p>
        </div>
        <button
          type="button"
          onClick={() => { setPreview(null); onUploaded(null) }}
          className="text-xs text-muted hover:text-red-500 transition-colors shrink-0"
        >
          Remove
        </button>
      </div>
    )
  }

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current.click()}
        className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-6 cursor-pointer transition-colors ${dragging ? 'border-sage bg-sage-light' : 'border-warm-border hover:border-sage hover:bg-sage-light/40'} ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        {uploading
          ? <><div className="w-6 h-6 rounded-full border-2 border-sage animate-spin" style={{ borderTopColor: 'transparent' }} /><p className="text-sm text-muted">Uploading…</p></>
          : <>
              <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              <div className="text-center">
                <p className="text-sm font-medium text-charcoal">Drag a photo here, or click to browse</p>
                <p className="text-xs text-muted mt-0.5">JPEG, PNG or WebP · max 8 MB</p>
              </div>
            </>
        }
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={e => upload(e.target.files[0])} />
      </div>
      {error && <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>}
    </div>
  )
}

function TierCard({ tier, onSelectFeatured }) {
  return (
    <div className={`rounded-2xl border p-8 flex flex-col gap-5 ${tier.highlight ? 'border-sage ring-1 ring-sage bg-white' : 'border-warm-border bg-white'}`}>
      {tier.highlight && (
        <span className="self-start text-xs font-semibold px-3 py-1 rounded-full bg-sage text-white tracking-wide">
          Most popular
        </span>
      )}
      <div>
        <p className="text-sm font-medium text-muted mb-1">{tier.name}</p>
        <p className="text-4xl font-bold text-charcoal">
          {tier.price}
          <span className="text-base font-normal text-muted ml-1">/ {tier.period}</span>
        </p>
      </div>
      <ul className="flex flex-col gap-2.5">
        {tier.features.map(f => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-charcoal">
            <svg className="w-4 h-4 text-sage shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      {tier.highlight ? (
        <button
          onClick={onSelectFeatured}
          className="mt-auto w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors duration-150 bg-sage hover:bg-sage-dark text-white"
        >
          {tier.cta}
        </button>
      ) : (
        <a
          href="#apply"
          className="mt-auto w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors duration-150 border-2 border-sage text-sage hover:bg-sage-light"
        >
          {tier.cta}
        </a>
      )}
    </div>
  )
}

export default function ForFuneralDirectors() {
  useEffect(() => {
    setPageMeta({
      title: 'For Funeral Directors — List Your Prices | FuneralFair',
      description: 'List your funeral directors business on FuneralFair and reach families actively comparing prices. Free standard listing. No commission ever.',
      path: '/for-funeral-directors',
    })
  }, [])
  const [form, setForm] = useState({
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    postcode: '',
    website: '',
    attended_price: '',
    cremation_price: '',
    packages: '',
    message: '',
  })
  const [status,        setStatus]        = useState(null) // null | 'sending' | 'success' | 'error'
  const [photoUrl,      setPhotoUrl]      = useState(null)
  const [featuredForm,  setFeaturedForm]  = useState({ name: '', email: '', website: '' })
  const [featuredOpen,  setFeaturedOpen]  = useState(false)
  const [featuredState, setFeaturedState] = useState(null) // null | 'sending' | 'error'

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleFeaturedChange(e) {
    setFeaturedForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function openFeatured() {
    setFeaturedOpen(true)
    setTimeout(() => document.getElementById('featured-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
  }

  async function handleFeaturedSubmit(e) {
    e.preventDefault()
    setFeaturedState('sending')
    try {
      let website = featuredForm.website.trim()
      if (website && !/^https?:\/\//i.test(website)) website = 'https://' + website
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...featuredForm, website }),
      })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        setFeaturedState('error')
      }
    } catch {
      setFeaturedState('error')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ...(photoUrl ? { photo_url: photoUrl } : {}) }),
      })
      if (res.ok) {
        setStatus('success')
        setPhotoUrl(null)
        setForm({ business_name: '', contact_name: '', email: '', phone: '', postcode: '', website: '', attended_price: '', cremation_price: '', packages: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      {/* ── Hero ── */}
      <section className="flex flex-col items-center text-center px-4 sm:px-6 pt-20 pb-20 sm:pt-28 sm:pb-24">
        <span className="inline-flex items-center gap-1.5 mb-6 px-3 py-1 rounded-full bg-sage-light border border-sage-border text-sage text-xs font-semibold tracking-widest uppercase">
          For funeral directors
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-charcoal leading-tight max-w-2xl mb-5">
          Your prices are already being compared.
        </h1>
        <p className="text-lg text-muted max-w-xl leading-relaxed mb-8">
          Families in your area are using FuneralFair right now to find a funeral director they can trust.
          Claim your free listing so they find accurate information — and find you.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="#apply"
            className="px-8 py-3.5 bg-sage hover:bg-sage-dark text-white font-semibold rounded-xl transition-colors duration-150 shadow-sm text-base"
          >
            Claim your free listing
          </a>
          <Link
            to="/director-login"
            className="px-8 py-3.5 border-2 border-charcoal/30 text-charcoal hover:border-charcoal font-semibold rounded-xl transition-colors duration-150 text-base"
            style={{ touchAction: 'manipulation' }}
          >
            Manage listing
          </Link>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="bg-white border-t border-warm-border px-4 sm:px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-charcoal mb-3">Why list on FuneralFair?</h2>
            <p className="text-muted max-w-md mx-auto">We're building the most trusted funeral price comparison site in the UK — and we want independent directors at the heart of it.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {BENEFITS.map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sage-light border border-sage-border flex items-center justify-center">
                  {icon}
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal mb-1.5">{title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="px-4 sm:px-6 py-20 bg-cream">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-charcoal mb-3">Simple, honest pricing</h2>
            <p className="text-muted">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {TIERS.map(tier => (
              <TierCard key={tier.name} tier={tier} onSelectFeatured={openFeatured} />
            ))}
          </div>

          {/* Featured checkout form */}
          {featuredOpen && (
            <div id="featured-form" className="mt-10 bg-white border border-sage rounded-2xl p-8 max-w-lg mx-auto">
              <h3 className="text-xl font-bold text-charcoal mb-1">Get featured</h3>
              <p className="text-sm text-muted mb-6">Enter your details and you'll be taken to a secure payment page. £49/month, cancel any time.</p>
              <form onSubmit={handleFeaturedSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="feat-name" className="text-sm font-medium text-charcoal">Business name <span className="text-red-400">*</span></label>
                  <input
                    id="feat-name" name="name" required value={featuredForm.name} onChange={handleFeaturedChange}
                    placeholder="e.g. Smith & Sons Funeral Directors" autoComplete="organization"
                    className="px-4 py-3 rounded-xl border border-warm-border bg-cream text-charcoal placeholder-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="feat-email" className="text-sm font-medium text-charcoal">Email <span className="text-red-400">*</span></label>
                  <input
                    id="feat-email" name="email" type="email" required value={featuredForm.email} onChange={handleFeaturedChange}
                    placeholder="you@yourbusiness.co.uk" autoComplete="email"
                    className="px-4 py-3 rounded-xl border border-warm-border bg-cream text-charcoal placeholder-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="feat-website" className="text-sm font-medium text-charcoal">Your website <span className="text-red-400">*</span></label>
                  <input
                    id="feat-website" name="website" type="text" required value={featuredForm.website} onChange={handleFeaturedChange}
                    placeholder="https://yourwebsite.co.uk" autoComplete="url"
                    className="px-4 py-3 rounded-xl border border-warm-border bg-cream text-charcoal placeholder-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                  <p className="text-xs text-muted">This is how we match you to your listing in our database.</p>
                </div>
                {featuredState === 'error' && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    Something went wrong. Please try again.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={featuredState === 'sending'}
                  className="w-full py-3.5 bg-sage hover:bg-sage-dark disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  {featuredState === 'sending' ? 'Redirecting to payment…' : 'Proceed to payment →'}
                </button>
                <p className="text-xs text-muted text-center">Secure payment via Stripe · Cancel any time</p>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* ── Application form ── */}
      <section id="apply" className="bg-white border-t border-warm-border px-4 sm:px-6 py-20">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 rounded-full bg-sage-light border border-sage-border text-sage text-xs font-semibold tracking-widest uppercase">
              Always free
            </span>
            <h2 className="text-3xl font-bold text-charcoal mb-3">Apply to list your business for free</h2>
            <p className="text-muted text-sm leading-relaxed">
              A standard listing costs nothing — no credit card, no catch.
              Fill in your details and we'll be in touch within 2 working days.
              Already listed? Use the same form to claim your listing.
            </p>
          </div>

          {status === 'success' ? (
            <div className="rounded-2xl bg-sage-light border border-sage-border px-8 py-12 text-center">
              <svg className="w-10 h-10 text-sage mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-charcoal mb-2">Application received</h3>
              <p className="text-muted text-sm leading-relaxed">
                Thank you — we'll review your details and be in touch within 2 working days.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="app-business" className="text-sm font-medium text-charcoal">Business name <span className="text-red-400">*</span></label>
                  <input
                    id="app-business" name="business_name" required value={form.business_name} onChange={handleChange}
                    placeholder="e.g. Smith & Sons Funeral Directors" autoComplete="organization"
                    className="px-4 py-3 rounded-xl border border-warm-border bg-cream text-charcoal placeholder-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="app-contact" className="text-sm font-medium text-charcoal">Your name <span className="text-red-400">*</span></label>
                  <input
                    id="app-contact" name="contact_name" required value={form.contact_name} onChange={handleChange}
                    placeholder="e.g. John Smith" autoComplete="name"
                    className="px-4 py-3 rounded-xl border border-warm-border bg-cream text-charcoal placeholder-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="app-email" className="text-sm font-medium text-charcoal">Email <span className="text-red-400">*</span></label>
                  <input
                    id="app-email" name="email" type="email" required value={form.email} onChange={handleChange}
                    placeholder="you@yourbusiness.co.uk" autoComplete="email"
                    className="px-4 py-3 rounded-xl border border-warm-border bg-cream text-charcoal placeholder-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="app-phone" className="text-sm font-medium text-charcoal">Phone</label>
                  <input
                    id="app-phone" name="phone" type="tel" value={form.phone} onChange={handleChange}
                    placeholder="e.g. 0151 123 4567" autoComplete="tel"
                    className="px-4 py-3 rounded-xl border border-warm-border bg-cream text-charcoal placeholder-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="app-postcode" className="text-sm font-medium text-charcoal">Postcode</label>
                  <input
                    id="app-postcode" name="postcode" value={form.postcode} onChange={handleChange}
                    placeholder="e.g. L1 1AA" autoComplete="postal-code"
                    className="px-4 py-3 rounded-xl border border-warm-border bg-cream text-charcoal placeholder-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="app-website" className="text-sm font-medium text-charcoal">Website</label>
                  <input
                    id="app-website" name="website" type="url" value={form.website} onChange={handleChange}
                    placeholder="https://yourwebsite.co.uk" autoComplete="url"
                    className="px-4 py-3 rounded-xl border border-warm-border bg-cream text-charcoal placeholder-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                </div>
              </div>
              {/* Pricing section */}
              <div className="border-t border-warm-border pt-5">
                <p className="text-sm font-semibold text-charcoal mb-1">Your pricing <span className="font-normal text-muted">(optional)</span></p>
                <p className="text-xs text-muted mb-4 leading-relaxed">
                  We source prices from your published Standardised Price List — but if yours have changed or aren't listed yet, add them here and we'll update your listing.
                </p>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-charcoal">Attended funeral price (£)</label>
                    <input
                      name="attended_price" type="number" min="0" value={form.attended_price} onChange={handleChange}
                      placeholder="e.g. 3500"
                      className="px-4 py-3 rounded-xl border border-warm-border bg-cream text-charcoal placeholder-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                    />
                    <p className="text-xs text-muted">Your SPL attended funeral price, including the coffin</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-charcoal">Direct cremation price (£)</label>
                    <input
                      name="cremation_price" type="number" min="0" value={form.cremation_price} onChange={handleChange}
                      placeholder="e.g. 1200"
                      className="px-4 py-3 rounded-xl border border-warm-border bg-cream text-charcoal placeholder-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                    />
                    <p className="text-xs text-muted">Your SPL simple cremation price</p>
                  </div>
                </div>
              </div>

              {/* Packages section */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-charcoal">Packages & services <span className="font-normal text-muted">(optional)</span></label>
                <textarea
                  name="packages" value={form.packages} onChange={handleChange} rows={4}
                  placeholder={`Describe any packages or services you offer — for example:\n• Unattended cremation from £895 (no hearse, ashes returned by post)\n• Standard attended funeral from £2,800 including hearse and limousine\n• Home visit arrangements available\n• 24-hour care and collection`}
                  className="px-4 py-3 rounded-xl border border-warm-border bg-cream text-charcoal placeholder-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage resize-none"
                />
                <p className="text-xs text-muted leading-relaxed">
                  This helps families understand what you offer beyond the standard SPL prices. We'll display relevant details on your listing once reviewed.
                </p>
              </div>

              {/* Photo upload */}
              <div className="border-t border-warm-border pt-5 flex flex-col gap-2">
                <p className="text-sm font-semibold text-charcoal">Photo <span className="font-normal text-muted">(optional)</span></p>
                <p className="text-xs text-muted leading-relaxed">
                  A photo of your premises or team makes your listing much more likely to get attention from families. We'll review it before publishing.
                </p>
                <ApplicationPhotoUpload onUploaded={url => setPhotoUrl(url)} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-charcoal">Anything else you'd like us to know?</label>
                <textarea
                  name="message" value={form.message} onChange={handleChange} rows={3}
                  placeholder="e.g. I'm already listed and want to claim my listing, or I'd like to discuss the Featured plan..."
                  className="px-4 py-3 rounded-xl border border-warm-border bg-cream text-charcoal placeholder-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage resize-none"
                />
              </div>

              {status === 'error' && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  Something went wrong. Please try again or email us directly.
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full py-3.5 bg-sage hover:bg-sage-dark disabled:opacity-60 text-white font-semibold rounded-xl transition-colors duration-150 text-base"
              >
                {status === 'sending' ? 'Sending…' : 'Apply for free listing'}
              </button>

              <p className="text-xs text-muted text-center leading-relaxed">
                We'll never share your details with third parties. By submitting you agree to be contacted about your listing.
              </p>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
