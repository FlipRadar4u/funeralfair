import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { setPageMeta } from '../utils/setPageMeta'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function formatPrice(val) {
  if (val == null) return null
  const n = Number(val)
  if (isNaN(n)) return null
  return `£${n.toLocaleString('en-GB')}`
}

function GreenBadge({ label, description }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-sage-light border border-sage-border text-sage">
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

function StarRating({ rating, reviews, name, town }) {
  if (!rating) return null
  const stars = Math.round(Number(rating))
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${town} funeral director`)}`
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <svg
            key={i}
            className={`w-4 h-4 ${i <= stars ? 'text-amber-400' : 'text-warm-border'}`}
            viewBox="0 0 20 20" fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-sm font-semibold text-charcoal">{Number(rating).toFixed(1)}</span>
      {reviews > 0 && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="text-sm text-muted hover:text-sage underline underline-offset-2 transition-colors"
        >
          {reviews.toLocaleString()} Google reviews
        </a>
      )}
    </div>
  )
}

function InfoRow({ icon, children }) {
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-warm-border last:border-0">
      <span className="text-muted mt-0.5 shrink-0">{icon}</span>
      <span className="text-charcoal text-sm leading-relaxed">{children}</span>
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex justify-center py-32">
      <div
        className="w-9 h-9 rounded-full border-2 border-sage animate-spin"
        style={{ borderTopColor: 'transparent' }}
      />
    </div>
  )
}

const PIN_ICON = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />
  </svg>
)

const PHONE_ICON = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25z" />
  </svg>
)

const GLOBE_ICON = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
)

const INFO_ICON = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
)

const CLOCK_ICON = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
  </svg>
)

// ── Star picker (write-review form) ──────────────────────────────────────────

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  const STAR_PATH = 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5 focus:outline-none"
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
        >
          <svg className={`w-7 h-7 transition-colors ${i <= (hover || value) ? 'text-amber-400' : 'text-warm-border'}`} viewBox="0 0 20 20" fill="currentColor">
            <path d={STAR_PATH} />
          </svg>
        </button>
      ))}
    </div>
  )
}

function ReviewStars({ rating }) {
  const STAR_PATH = 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-4 h-4 ${i <= rating ? 'text-amber-400' : 'text-warm-border'}`} viewBox="0 0 20 20" fill="currentColor">
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  )
}

function WriteReviewForm({ directorId }) {
  const [form, setForm]         = useState({ name: '', rating: 0, body: '' })
  const [status, setStatus]     = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.rating)                      { setErrorMsg('Please select a star rating.'); return }
    if (form.body.trim().length < 20)      { setErrorMsg('Review must be at least 20 characters.'); return }
    setStatus('sending'); setErrorMsg('')
    try {
      const res  = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ directorId, reviewerName: form.name, rating: form.rating, reviewBody: form.body }),
      })
      const data = await res.json()
      if (!res.ok) { setErrorMsg(data.error || 'Something went wrong.'); setStatus(null); return }
      setStatus('success')
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
      setStatus(null)
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-sage-light border border-sage-border rounded-xl px-5 py-4 text-center mt-4">
        <p className="font-semibold text-sage mb-1">Thanks for your review!</p>
        <p className="text-sm text-charcoal">It'll appear here once approved — usually within 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-5 mt-4 border-t border-warm-border">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-charcoal">Your name <span className="text-red-400">*</span></label>
        <input
          required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Jane S." autoComplete="name"
          className="px-3 py-2.5 rounded-xl border border-warm-border bg-cream text-sm text-charcoal placeholder-muted focus:outline-none focus:ring-2 focus:ring-sage"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-charcoal">Your rating <span className="text-red-400">*</span></label>
        <StarPicker value={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-charcoal">Your experience <span className="text-red-400">*</span></label>
        <textarea
          required rows={4} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
          placeholder="Share your experience with this funeral director…"
          className="px-3 py-2.5 rounded-xl border border-warm-border bg-cream text-sm text-charcoal placeholder-muted focus:outline-none focus:ring-2 focus:ring-sage resize-none"
        />
        <p className="text-xs text-muted text-right">{form.body.length} / 1000</p>
      </div>
      {errorMsg && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{errorMsg}</p>
      )}
      <button
        type="submit" disabled={status === 'sending'}
        className="w-full py-3 bg-sage hover:bg-sage-dark disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
      >
        {status === 'sending' ? 'Submitting…' : 'Submit review'}
      </button>
      <p className="text-xs text-muted text-center">Reviews are checked before appearing. We never share your details.</p>
    </form>
  )
}

function ReviewsSection({ director }) {
  const [showForm, setShowForm] = useState(false)
  const reviews = director.reviews || []

  // No reviews yet — show minimal link so the page doesn't have a "No reviews" dead-end
  if (reviews.length === 0 && !showForm) {
    return (
      <p className="text-xs text-center text-muted">
        <button onClick={() => setShowForm(true)} className="text-sage font-semibold hover:underline">
          Leave a review
        </button>
        {' '}for {director.name}
      </p>
    )
  }

  // Form only (no reviews yet but user clicked to write one)
  if (reviews.length === 0 && showForm) {
    return (
      <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-7 py-6">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-1">Leave a review</h2>
        <WriteReviewForm directorId={director.id} />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-7 py-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">
          Reviews ({reviews.length})
        </h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="text-xs font-semibold text-sage hover:underline">
            + Write a review
          </button>
        )}
      </div>
      <div className="mt-3 divide-y divide-warm-border">
        {reviews.map(r => (
          <div key={r.id} className="py-4">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1.5">
              <ReviewStars rating={r.rating} />
              <span className="text-sm font-semibold text-charcoal">{r.reviewer_name}</span>
              <span className="text-xs text-muted">
                · {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <p className="text-sm text-charcoal leading-relaxed">{r.body}</p>
          </div>
        ))}
      </div>
      {showForm && <WriteReviewForm directorId={director.id} />}
    </div>
  )
}

function FaqAccordion({ faqs }) {
  const [open, setOpen] = useState(null)
  if (!faqs?.length) return null
  return (
    <div className="flex flex-col divide-y divide-warm-border">
      {faqs.map((faq, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-3 py-4 text-left"
          >
            <span className="text-sm font-semibold text-charcoal">{faq.q}</span>
            <svg className={`w-4 h-4 text-muted shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {open === i && (
            <p className="text-sm text-muted leading-relaxed pb-4">{faq.a}</p>
          )}
        </div>
      ))}
    </div>
  )
}

function PhotoGallery({ photos }) {
  const [active, setActive] = useState(null)
  if (!photos?.length) return null
  return (
    <div className="bg-white rounded-2xl border border-warm-border shadow-sm overflow-hidden">
      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto p-4 scrollbar-hide">
        {photos.map((url, i) => (
          <button
            key={i}
            onClick={() => setActive(url)}
            className="shrink-0 w-32 h-24 rounded-xl overflow-hidden border border-warm-border hover:border-sage transition-colors"
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      {/* Lightbox */}
      {active && createPortal(
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <img src={active} alt="" className="max-w-full max-h-full rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
          <button onClick={() => setActive(null)} className="absolute top-5 right-5 text-white text-3xl leading-none">×</button>
        </div>,
        document.body
      )}
    </div>
  )
}

function EnquiryForm({ director }) {
  const [form, setForm]     = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState(null) // null | 'sending' | 'success' | 'error'

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directorId:    director.id,
          directorName:  director.name,
          directorTown:  director.town,
          enquirerName:  form.name,
          enquirerEmail: form.email,
          enquirerPhone: form.phone,
          message:       form.message,
        }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-7 py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-sage-light border border-sage-border flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-sage" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
        </div>
        <h3 className="font-semibold text-charcoal mb-1">Enquiry sent</h3>
        <p className="text-sm text-muted">We've forwarded your message to {director.name}. They'll be in touch soon.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-sage ring-1 ring-sage shadow-sm px-7 py-6">
      <h2 className="text-base font-semibold text-charcoal mb-0.5">Send an enquiry</h2>
      <p className="text-sm text-muted mb-5">We'll forward your message to {director.name}.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="enq-name" className="text-xs font-medium text-charcoal">Your name <span className="text-red-400">*</span></label>
            <input
              id="enq-name" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Jane Smith" autoComplete="name"
              className="px-3 py-2.5 rounded-xl border border-warm-border bg-cream text-sm text-charcoal placeholder-muted focus:outline-none focus:ring-2 focus:ring-sage"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="enq-email" className="text-xs font-medium text-charcoal">Your email <span className="text-red-400">*</span></label>
            <input
              id="enq-email" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@email.com" autoComplete="email"
              className="px-3 py-2.5 rounded-xl border border-warm-border bg-cream text-sm text-charcoal placeholder-muted focus:outline-none focus:ring-2 focus:ring-sage"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="enq-phone" className="text-xs font-medium text-charcoal">Phone <span className="text-muted font-normal">(optional)</span></label>
          <input
            id="enq-phone" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="e.g. 07700 900000" autoComplete="tel"
            className="px-3 py-2.5 rounded-xl border border-warm-border bg-cream text-sm text-charcoal placeholder-muted focus:outline-none focus:ring-2 focus:ring-sage"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="enq-message" className="text-xs font-medium text-charcoal">Message <span className="text-red-400">*</span></label>
          <textarea
            id="enq-message" required rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            placeholder="Tell them what you need help with…"
            className="px-3 py-2.5 rounded-xl border border-warm-border bg-cream text-sm text-charcoal placeholder-muted focus:outline-none focus:ring-2 focus:ring-sage resize-none"
          />
        </div>
        {status === 'error' && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            Something went wrong. Please try calling them directly.
          </p>
        )}
        <button
          type="submit" disabled={status === 'sending'}
          className="w-full py-3 bg-sage hover:bg-sage-dark disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          {status === 'sending' ? 'Sending…' : 'Send enquiry'}
        </button>
        <p className="text-xs text-muted text-center">No account needed. We'll never share your details.</p>
      </form>
    </div>
  )
}

export default function DirectorDetail() {
  const { id } = useParams()
  const { state, pathname } = useLocation()
  const navigate = useNavigate()
  const backUrl = state?.from || '/search'

  const [director,     setDirector]    = useState(null)
  const [loading,      setLoading]     = useState(true)
  const [error,        setError]       = useState(null)
  const [formVisible,  setFormVisible] = useState(false)
  const [copied,       setCopied]      = useState(false)

  useEffect(() => {
    let mounted = true
    fetch(`/api/director/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        if (!mounted) return
        setDirector(data)
        setLoading(false)
        const dirTitle = data.town
          ? `${data.name} | Funeral Director in ${data.town} | FuneralFair`
          : `${data.name} | Funeral Director | FuneralFair`
        const priceHints = []
        if (data.attended_price) priceHints.push(`attended funeral from £${Number(data.attended_price).toLocaleString('en-GB')}`)
        if (data.cremation_price) priceHints.push(`direct cremation from £${Number(data.cremation_price).toLocaleString('en-GB')}`)
        const priceText = priceHints.length ? ` — ${priceHints.join(', ')}` : ''
        const locationText = data.town ? ` in ${data.town}` : ''
        setPageMeta({
          title: dirTitle,
          description: `${data.name}${locationText}${priceText}. Compare prices and contact details on FuneralFair.`,
          path: `/director/${data.id}`,
        })

        // JSON-LD structured data
        const schema = {
          '@context': 'https://schema.org',
          '@type': 'FuneralParlor',
          name: data.name,
          address: {
            '@type': 'PostalAddress',
            ...(data.address   && { streetAddress: data.address }),
            ...(data.town      && { addressLocality: data.town }),
            ...(data.postcode  && { postalCode: data.postcode }),
            addressCountry: 'GB',
          },
          ...(data.phone   && { telephone: data.phone }),
          ...(data.website && { url: data.website }),
          ...(data.lat != null && data.lng != null && {
            geo: {
              '@type': 'GeoCoordinates',
              latitude:  data.lat,
              longitude: data.lng,
            },
          }),
          ...(data.google_rating && data.google_reviews > 0 && {
            aggregateRating: {
              '@type':       'AggregateRating',
              ratingValue:   Number(data.google_rating).toFixed(1),
              reviewCount:   data.google_reviews,
              bestRating:    '5',
              worstRating:   '1',
            },
          }),
        }

        let el = document.getElementById('ff-schema')
        if (!el) {
          el = document.createElement('script')
          el.id   = 'ff-schema'
          el.type = 'application/ld+json'
          document.head.appendChild(el)
        }
        el.textContent = JSON.stringify(schema)

        // BreadcrumbList schema
        const breadcrumbItems = [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://funeralfair.co.uk' },
          ...(data.town ? [{ '@type': 'ListItem', position: 2, name: `Funeral Directors in ${data.town}`, item: `https://funeralfair.co.uk/search?location=${encodeURIComponent(data.town)}` }] : []),
          { '@type': 'ListItem', position: data.town ? 3 : 2, name: data.name, item: `https://funeralfair.co.uk/director/${data.id}` },
        ]
        const breadcrumb = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbItems,
        }
        let bc = document.getElementById('ff-breadcrumb-schema')
        if (!bc) { bc = document.createElement('script'); bc.id = 'ff-breadcrumb-schema'; bc.type = 'application/ld+json'; document.head.appendChild(bc) }
        bc.textContent = JSON.stringify(breadcrumb)
      })
      .catch(err => { if (mounted) { setError(`Could not load director (${err})`); setLoading(false) } })
    return () => { mounted = false }
  }, [id])

  // Remove schema tags when leaving the page
  useEffect(() => () => {
    document.getElementById('ff-schema')?.remove()
    document.getElementById('ff-breadcrumb-schema')?.remove()
  }, [])

  // Save to recently viewed
  useEffect(() => {
    if (!director) return
    try {
      const key = 'ff_recently_viewed'
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      const updated = [
        { id: director.id, name: director.name, town: director.town },
        ...existing.filter(d => d.id !== director.id),
      ].slice(0, 5)
      localStorage.setItem(key, JSON.stringify(updated))
    } catch {}
  }, [director])

  // Hide sticky CTA bar when enquiry form scrolls into view
  useEffect(() => {
    if (!director) return
    const el = document.getElementById('enquiry-form')
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => setFormVisible(entry.isIntersecting), { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [director])

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 pb-24 sm:pb-12">

        {/* Back link */}
        <Link
          to={backUrl}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-charcoal transition-colors duration-150 mb-8 group"
        >
          <svg className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to results
        </Link>

        {/* Loading */}
        {loading && <Spinner />}

        {/* Error / not found */}
        {!loading && error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-red-700 text-sm">
            Could not load this funeral director: {error}
          </div>
        )}

        {/* Director detail */}
        {!loading && director && (
          <div className="flex flex-col gap-5">

            {/* ── Header card ── */}
            <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-5 sm:px-7 py-7">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-charcoal leading-tight">
                    {director.name}
                  </h1>
                  <p className="text-muted mt-1.5">
                    {director.town}
                    {director.postcode ? `, ${director.postcode}` : ''}
                  </p>
                  <StarRating rating={director.google_rating} reviews={director.google_reviews} name={director.name} town={director.town} />
                  {director.claimed_at && (
                    <div className="flex items-center gap-1.5 mt-3">
                      <svg className="w-4 h-4 text-sage shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                      </svg>
                      <span className="text-sm font-medium text-sage">Listing verified by this funeral director</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {(director.nafd_member || director.saif_member) && (
                    <div className="flex gap-2 flex-wrap justify-end">
                      {director.nafd_member && <GreenBadge label="NAFD member" description="National Association of Funeral Directors" />}
                      {director.saif_member && <GreenBadge label="SAIF member" description="Society of Allied & Independent Funeral Directors" />}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: director.name, url: window.location.href }).catch(() => {})
                      } else {
                        navigator.clipboard.writeText(window.location.href).then(() => {
                          setCopied(true)
                          setTimeout(() => setCopied(false), 2000)
                        }).catch(() => {})
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs text-muted hover:text-sage transition-colors"
                  >
                    {copied ? (
                      <>
                        <svg className="w-3.5 h-3.5 text-sage" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span className="text-sage font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185z" />
                        </svg>
                        Share
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Special offer banner ── */}
            {director.is_featured && director.special_offer && (
              <div className="bg-sage-light border border-sage-border rounded-2xl px-5 py-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-sage shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
                <p className="text-sm font-semibold text-sage">{director.special_offer}</p>
              </div>
            )}

            {/* ── Photo gallery (featured only) ── */}
            {director.is_featured && <PhotoGallery photos={director.photos} />}

            {/* ── About ── */}
            {director.description && (
              <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-5 sm:px-7 py-6">
                <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">About</h2>
                <p className="text-sm text-charcoal leading-relaxed whitespace-pre-wrap">{director.description}</p>
              </div>
            )}

            {/* ── Contact card ── */}
            <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-5 sm:px-7 py-2">
              <h2 className="text-xs font-semibold text-muted uppercase tracking-widest pt-5 pb-1">
                Contact
              </h2>

              {director.address && (
                <InfoRow icon={PIN_ICON}>
                  {director.address}{director.town ? `, ${director.town}` : ''}{director.postcode ? ` ${director.postcode}` : ''}
                  {director.lat != null && director.lng != null && (
                    <>
                      <br />
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${director.lat},${director.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sage text-xs font-medium hover:underline"
                      >
                        Get directions →
                      </a>
                    </>
                  )}
                </InfoRow>
              )}

              {director.phone && (
                <InfoRow icon={PHONE_ICON}>
                  <a
                    href={`tel:${director.phone}`}
                    className="text-sage hover:underline font-medium"
                    style={{ touchAction: 'manipulation' }}
                  >
                    {director.phone}
                  </a>
                </InfoRow>
              )}

              {director.website && (
                <InfoRow icon={GLOBE_ICON}>
                  <a
                    href={director.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sage hover:underline font-medium break-all"
                  >
                    {director.website.replace(/^https?:\/\//, '')}
                  </a>
                </InfoRow>
              )}

              {director.opening_hours && (
                <InfoRow icon={CLOCK_ICON}>{director.opening_hours}</InfoRow>
              )}

              {(director.facebook_url || director.instagram_url) && (
                <div className="flex items-center gap-3 py-3 border-b border-warm-border last:border-b-0">
                  {director.facebook_url && (
                    <a href={director.facebook_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-sage hover:underline font-medium">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </a>
                  )}
                  {director.instagram_url && (
                    <a href={director.instagram_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-sage hover:underline font-medium">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                      </svg>
                      Instagram
                    </a>
                  )}
                </div>
              )}

              {!director.address && !director.phone && !director.website && !director.opening_hours && (
                <p className="text-muted text-sm py-4">No contact details available.</p>
              )}
            </div>

            {/* ── Specialisms ── */}
            {director.is_featured && director.specialisms?.length > 0 && (
              <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-5 sm:px-7 py-6">
                <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Services & specialisms</h2>
                <div className="flex flex-wrap gap-2">
                  {director.specialisms.map(s => (
                    <span key={s} className="text-xs font-medium px-3 py-1.5 rounded-full bg-sage-light border border-sage-border text-sage">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Price breakdown card ── */}
            <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-5 sm:px-7 py-2">
              <h2 className="text-xs font-semibold text-muted uppercase tracking-widest pt-5 pb-1">
                Price breakdown
              </h2>

              <table className="w-full mt-3">
                <thead>
                  <tr className="border-b border-warm-border">
                    <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide pb-3">Service</th>
                    <th className="text-right text-xs font-semibold text-muted uppercase tracking-wide pb-3">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Attended funeral',  val: formatPrice(director.attended_price) },
                    { label: 'Direct cremation',  val: formatPrice(director.cremation_price) },
                  ].map(({ label, val }, i) => (
                    <tr key={label} className={i === 0 ? 'border-b border-warm-border' : ''}>
                      <td className="py-4 text-charcoal text-sm">{label}</td>
                      <td className="py-4 text-right tabular-nums">
                        {val
                          ? <span className="font-bold text-charcoal text-lg">{val}</span>
                          : <span className="text-sm text-muted">Price on request</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* SPL link */}
              {director.spl_url && (
                <a
                  href={director.spl_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-sage font-medium hover:underline mt-1 mb-2"
                >
                  View their standardised price list →
                </a>
              )}

              {/* Disclaimer */}
              <div className="flex items-start gap-2 mt-2 mb-6 py-3.5 border-t border-warm-border">
                <span className="text-muted shrink-0 mt-0.5">{INFO_ICON}</span>
                <p className="text-xs text-muted leading-relaxed">
                  Prices sourced from legally required Standardised Price List. Prices shown are guide prices and may vary based on individual circumstances. Always confirm directly with the funeral director.
                </p>
              </div>
            </div>

            {/* ── Enquiry form or website redirect ── */}
            <div id="enquiry-form">
              {director.has_email ? (
                <EnquiryForm director={director} />
              ) : (
                <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-5 sm:px-7 py-7 text-center">
                  <div className="w-12 h-12 rounded-full bg-sage-light border border-sage-border flex items-center justify-center mx-auto mb-4">
                    {GLOBE_ICON}
                  </div>
                  <h2 className="text-base font-semibold text-charcoal mb-2">Contact {director.name}</h2>
                  <p className="text-sm text-muted leading-relaxed mb-5">
                    Visit their website to send an enquiry or find their contact details.
                  </p>
                  {director.website ? (
                    <a
                      href={director.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-sage hover:bg-sage-dark text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
                    >
                      Visit website →
                    </a>
                  ) : director.phone ? (
                    <a
                      href={`tel:${director.phone}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-sage hover:bg-sage-dark text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
                    >
                      {PHONE_ICON} Call {director.phone}
                    </a>
                  ) : (
                    <p className="text-sm text-muted">No contact details available yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* ── FAQs ── */}
            {director.is_featured && director.faqs?.length > 0 && (
              <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-5 sm:px-7 py-6">
                <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">Frequently asked questions</h2>
                <FaqAccordion faqs={director.faqs} />
              </div>
            )}

            {/* ── Reviews ── */}
            <ReviewsSection director={director} />

            {/* ── Visit website CTA (only when form is shown) ── */}
            {director.has_email && director.website && (
              <a
                href={director.website}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center py-3.5 bg-white border border-warm-border hover:border-sage text-charcoal font-semibold rounded-xl transition-colors duration-150 text-sm"
              >
                Visit website →
              </a>
            )}

            {/* Claim listing nudge — hidden if already claimed */}
            {!director.claimed_at && (
              <div className="rounded-xl border border-warm-border bg-white px-5 py-4">
                <p className="text-sm text-muted leading-relaxed">
                  Are you this funeral director?{' '}
                  <Link to="/for-funeral-directors" className="text-charcoal font-medium underline underline-offset-2 hover:opacity-70 transition-opacity">
                    Claim your listing
                  </Link>
                  {' '}to keep your prices and details up to date.
                </p>
              </div>
            )}

            {/* Report inaccurate details */}
            <div className="text-center">
              <a
                href={`mailto:hello@funeralfair.co.uk?subject=${encodeURIComponent(`Inaccurate listing: ${director.name}`)}&body=${encodeURIComponent(`Hi,\n\nI'd like to report inaccurate details on the following listing:\n\n${director.name}\nhttps://funeralfair.co.uk${pathname}\n\nDetails to correct:\n\n`)}`}
                className="text-xs text-muted hover:text-charcoal underline underline-offset-2 transition-colors duration-150"
              >
                Report inaccurate details
              </a>
            </div>

            {/* Bottom back link */}
            <Link
              to={backUrl}
              className="inline-flex items-center justify-center gap-2 text-sm font-medium text-muted hover:text-charcoal transition-colors duration-150 py-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Back to results
            </Link>

          </div>
        )}

      </main>

      {/* ── Sticky mobile CTA bar — hidden when enquiry form is in view ── */}
      {!loading && director && !formVisible && (director.phone || director.has_email || director.website) && createPortal(
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-warm-border shadow-lg px-4 py-3 flex gap-3">
          {director.phone && (
            <a
              href={`tel:${director.phone}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-sage text-sage font-semibold text-sm"
              style={{ touchAction: 'manipulation' }}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25z" />
              </svg>
              Call
            </a>
          )}
          {director.has_email ? (
            <a
              href="#enquiry"
              onClick={e => { e.preventDefault(); document.getElementById('enquiry-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
              className={`${director.phone ? 'flex-1' : 'flex-[2]'} flex items-center justify-center gap-2 py-3 rounded-xl bg-sage text-white font-semibold text-sm`}
              style={{ touchAction: 'manipulation' }}
            >
              Send enquiry
            </a>
          ) : director.website ? (
            <a
              href={director.website}
              target="_blank"
              rel="noopener noreferrer"
              className={`${director.phone ? 'flex-1' : 'flex-[2]'} flex items-center justify-center gap-2 py-3 rounded-xl bg-sage text-white font-semibold text-sm`}
              style={{ touchAction: 'manipulation' }}
            >
              Visit website →
            </a>
          ) : null}
        </div>,
        document.body
      )}

      <Footer />
    </div>
  )
}
