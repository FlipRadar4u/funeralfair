import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
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

export default function DirectorDetail() {
  const { id } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const backUrl = state?.from || '/search'

  const [director, setDirector] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    async function fetchDirector() {
      const { data, error: err } = await supabase
        .from('funeral_directors')
        .select('*')
        .eq('id', id)
        .single()

      if (err) setError(err.message)
      else setDirector(data)
      setLoading(false)
    }
    fetchDirector()
  }, [id])

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">

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
                </div>
                {(director.nafd_member || director.saif_member) && (
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    {director.nafd_member && <GreenBadge label="NAFD member" description="National Association of Funeral Directors" />}
                    {director.saif_member && <GreenBadge label="SAIF member" description="Society of Allied & Independent Funeral Directors" />}
                  </div>
                )}
              </div>
            </div>

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

            {/* ── Visit website CTA ── */}
            {director.website && (
              <a
                href={director.website}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center py-3.5 bg-sage hover:bg-sage-dark text-white font-semibold rounded-xl transition-colors duration-150 shadow-sm text-base"
              >
                Visit website
              </a>
            )}

            {/* Claim listing nudge */}
            <div className="rounded-xl border border-warm-border bg-white px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-muted leading-relaxed">
                Are you this funeral director? <span className="text-charcoal font-medium">Claim your listing</span> to keep your prices and details up to date.
              </p>
              <Link
                to="/for-funeral-directors"
                className="shrink-0 text-sm font-semibold text-sage hover:underline"
              >
                Claim listing →
              </Link>
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

      <Footer />
    </div>
  )
}
