import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { createPortal } from 'react-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function formatPrice(val) {
  if (val == null) return '—'
  const n = Number(val)
  if (isNaN(n)) return '—'
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

  const [director, setDirector] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    fetch(`/api/director/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        setDirector(data)
        setLoading(false)
        document.title = `${data.name} — FuneralFair`
        document.querySelector('meta[name="description"]')?.setAttribute('content', `Compare prices for ${data.name} in ${data.town}. Attended funeral and direct cremation prices from their published Standardised Price List.`)
      })
      .catch(err => { setError(`Could not load director (${err})`); setLoading(false) })
  }, [id])

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
            <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-7 py-7">
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
                {(director.nafd_member || director.saif_member) && (
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    {director.nafd_member && <GreenBadge label="NAFD member" description="National Association of Funeral Directors" />}
                    {director.saif_member && <GreenBadge label="SAIF member" description="Society of Allied & Independent Funeral Directors" />}
                  </div>
                )}
              </div>
            </div>

            {/* ── Photo gallery (featured only) ── */}
            {director.is_featured && <PhotoGallery photos={director.photos} />}

            {/* ── Contact card ── */}
            <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-7 py-2">
              <h2 className="text-xs font-semibold text-muted uppercase tracking-widest pt-5 pb-1">
                Contact
              </h2>

              {director.address && (
                <InfoRow icon={PIN_ICON}>
                  {director.address}{director.town ? `, ${director.town}` : ''}{director.postcode ? ` ${director.postcode}` : ''}
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

              {!director.address && !director.phone && !director.website && (
                <p className="text-muted text-sm py-4">No contact details available.</p>
              )}
            </div>

            {/* ── Price breakdown card ── */}
            <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-7 py-2">
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
                  <tr className="border-b border-warm-border">
                    <td className="py-4 text-charcoal text-sm">Attended funeral</td>
                    <td className="py-4 text-right font-bold text-charcoal text-lg tabular-nums">
                      {formatPrice(director.attended_price)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 text-charcoal text-sm">Direct cremation</td>
                    <td className="py-4 text-right font-bold text-charcoal text-lg tabular-nums">
                      {formatPrice(director.cremation_price)}
                    </td>
                  </tr>
                </tbody>
              </table>

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
                <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-7 py-7 text-center">
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

      {/* ── Sticky mobile CTA bar ── */}
      {!loading && director && createPortal(
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
