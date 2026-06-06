import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_FREE     = 1
const MAX_FEATURED = 10

const OFFER_PRESETS = [
  'Free floral tribute with every attended funeral',
  'Free home visit — we come to you',
  'No hidden fees — price as advertised',
  'Bereavement support included',
  'Pre-paid funeral plans available',
  'Free 24-hour advice line',
]

const SPECIALISMS = [
  'Natural / green burial',
  'Woodland burial',
  'Repatriation',
  'Jewish funerals',
  'Islamic / Muslim funerals',
  'Hindu funerals',
  'Sikh funerals',
  'Pre-paid funeral plans',
  'Eco-friendly funerals',
  'LGBTQ+ inclusive',
  'Direct cremation',
  'Home funerals',
  'Memorial services',
  'Children & infant funerals',
  'Military funerals',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(val) {
  if (val == null || val === '') return ''
  const n = Number(val)
  return isNaN(n) ? '' : String(n)
}

// ── Small UI components ───────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex justify-center py-32">
      <div className="w-9 h-9 rounded-full border-2 border-sage animate-spin" style={{ borderTopColor: 'transparent' }} />
    </div>
  )
}

function PriceInput({ label, hint, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-charcoal uppercase tracking-wide">{label}</label>
      {hint && <p className="text-xs text-muted -mt-0.5">{hint}</p>}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-semibold text-sm">£</span>
        <input type="number" min="100" max="50000" step="1" value={value} onChange={e => onChange(e.target.value)}
          placeholder="e.g. 3200"
          className="w-full pl-8 pr-4 py-3 rounded-xl border border-warm-border bg-cream text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-sage" />
      </div>
    </div>
  )
}

function TextInput({ label, hint, value, onChange, type = 'text', placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-charcoal uppercase tracking-wide">{label}</label>
      {hint && <p className="text-xs text-muted -mt-0.5">{hint}</p>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-warm-border bg-cream text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-sage" />
    </div>
  )
}

function SectionHeader({ title, badge }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <h2 className="text-base font-semibold text-charcoal">{title}</h2>
      {badge && <span className="text-xs font-bold text-sage uppercase tracking-widest bg-sage-light border border-sage-border px-2.5 py-0.5 rounded-full">{badge}</span>}
    </div>
  )
}

function LockedFeature({ title, description, onUpgrade }) {
  return (
    <div className="rounded-xl border border-dashed border-sage/40 bg-sage-light/30 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-sage-light border border-sage-border flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-sage" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z" />
          </svg>
        </div>
        <div className="min-w-0">
          <span className="text-xs font-bold text-sage uppercase tracking-widest">Featured only</span>
          <p className="text-sm font-semibold text-charcoal mt-0.5">{title}</p>
          <p className="text-xs text-muted mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <button onClick={onUpgrade}
        className="shrink-0 px-4 py-2 bg-sage hover:bg-sage-dark text-white font-semibold rounded-lg text-xs transition-colors whitespace-nowrap">
        Upgrade to Featured
      </button>
    </div>
  )
}

// ── Photos ────────────────────────────────────────────────────────────────────

function PhotoUpload({ token, onUploaded }) {
  const [dragging, setDragging]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState(null)
  const inputRef                  = useRef(null)

  async function upload(file) {
    if (!file) return
    setError(null); setUploading(true)
    const fd = new FormData()
    fd.append('token', token); fd.append('file', file)
    try {
      const res  = await fetch('/api/director/upload-photo', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Upload failed'); return }
      onUploaded(data.url)
    } catch { setError('Upload failed — please try again') }
    finally { setUploading(false) }
  }

  const onDrop = useCallback(e => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files[0]) }, [token])

  return (
    <div>
      <div onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)}
        onDrop={onDrop} onClick={() => !uploading && inputRef.current.click()}
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-8 py-8 cursor-pointer transition-colors ${dragging ? 'border-sage bg-sage-light' : 'border-warm-border hover:border-sage hover:bg-sage-light/40'} ${uploading ? 'pointer-events-none opacity-60' : ''}`}>
        {uploading
          ? <><div className="w-7 h-7 rounded-full border-2 border-sage animate-spin" style={{ borderTopColor: 'transparent' }} /><p className="text-sm text-muted">Uploading…</p></>
          : <>
              <svg className="w-7 h-7 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              <div className="text-center">
                <p className="text-sm font-medium text-charcoal">Drag a photo here, or click to browse</p>
                <p className="text-xs text-muted mt-0.5">JPEG, PNG or WebP · max 8 MB</p>
              </div>
            </>}
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={e => upload(e.target.files[0])} />
      </div>
      {error && <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>}
    </div>
  )
}

// ── Enquiry history ───────────────────────────────────────────────────────────

function fmtEnquiryDate(iso) {
  const d   = new Date(iso)
  const now = new Date()
  const sameYear = d.getFullYear() === now.getFullYear()
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) })
}

function EnquiriesSection({ token }) {
  const [enquiries, setEnquiries] = useState(null)
  const [expanded,  setExpanded]  = useState(null)

  useEffect(() => {
    fetch(`/api/director/enquiries?token=${encodeURIComponent(token)}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setEnquiries(Array.isArray(data) ? data : []))
      .catch(() => setEnquiries([]))
  }, [token])

  if (enquiries === null) return null

  return (
    <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-6 py-5">
      <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
        Enquiries {enquiries.length > 0 && <span className="ml-1 text-charcoal">({enquiries.length})</span>}
      </p>
      {enquiries.length === 0 ? (
        <p className="text-sm text-muted text-center py-4 leading-relaxed">
          No enquiries yet. When families contact you via FuneralFair, they'll appear here.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-warm-border -mx-6 px-6">
          {enquiries.map(e => (
            <div key={e.id} className="py-3 first:pt-0 last:pb-0">
              <button
                onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                className="w-full text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-charcoal">{e.enquirer_name}</p>
                    <p className="text-xs text-muted truncate mt-0.5">{e.message}</p>
                  </div>
                  <p className="text-xs text-muted whitespace-nowrap shrink-0 pt-0.5">{fmtEnquiryDate(e.created_at)}</p>
                </div>
              </button>
              {expanded === e.id && (
                <div className="mt-3 bg-cream rounded-xl border border-warm-border px-4 py-3">
                  <div className="flex flex-col gap-1 mb-3">
                    <p className="text-xs text-muted">
                      Email:{' '}
                      <a href={`mailto:${e.enquirer_email}`} className="text-sage font-semibold hover:underline">
                        {e.enquirer_email}
                      </a>
                    </p>
                    {e.enquirer_phone && (
                      <p className="text-xs text-muted">
                        Phone: <span className="text-charcoal font-semibold">{e.enquirer_phone}</span>
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-charcoal leading-relaxed whitespace-pre-wrap">{e.message}</p>
                  <a
                    href={`mailto:${e.enquirer_email}?subject=Re: Your enquiry via FuneralFair`}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sage hover:underline"
                  >Reply by email →</a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Photos ────────────────────────────────────────────────────────────────────

function PhotoGrid({ photos, pending, token, onPhotosChange, onPendingChange }) {
  const [deletingUrl, setDeletingUrl] = useState(null)

  async function handleDelete(url, field) {
    if (!window.confirm('Remove this photo? This cannot be undone.')) return
    setDeletingUrl(url)
    try {
      const res = await fetch('/api/director/delete-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, url }),
      })
      if (!res.ok) { window.alert('Failed to remove photo. Please try again.'); return }
      if (field === 'photos') onPhotosChange((photos || []).filter(u => u !== url))
      else onPendingChange((pending || []).filter(u => u !== url))
    } finally {
      setDeletingUrl(null)
    }
  }

  async function handleMove(index, dir) {
    const arr = [...(photos || [])]
    const target = index + dir
    if (target < 0 || target >= arr.length) return
    ;[arr[index], arr[target]] = [arr[target], arr[index]]
    onPhotosChange(arr)
    await fetch('/api/director/reorder-photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, photos: arr }),
    })
  }

  if (!photos?.length && !pending?.length) return null
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
      {(photos || []).map((url, i) => (
        <div key={`a-${url}`} className="relative aspect-video rounded-xl overflow-hidden border border-warm-border group">
          <img src={url} alt="" className="w-full h-full object-cover" />
          <span className="absolute bottom-1.5 left-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sage text-white">
            {i === 0 ? 'Main photo' : 'Live'}
          </span>
          {/* Reorder arrows */}
          <div className="absolute bottom-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {i > 0 && (
              <button
                onClick={() => handleMove(i, -1)}
                disabled={!!deletingUrl}
                className="w-6 h-6 rounded-md bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70 disabled:opacity-40"
                title="Move left"
              >←</button>
            )}
            {i < (photos || []).length - 1 && (
              <button
                onClick={() => handleMove(i, 1)}
                disabled={!!deletingUrl}
                className="w-6 h-6 rounded-md bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70 disabled:opacity-40"
                title="Move right"
              >→</button>
            )}
          </div>
          {/* Delete button */}
          <button
            onClick={() => handleDelete(url, 'photos')}
            disabled={deletingUrl === url}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-black/50 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-40"
            title="Remove photo"
          >{deletingUrl === url ? '…' : '✕'}</button>
        </div>
      ))}
      {(pending || []).map((url, i) => (
        <div key={`p-${url}`} className="relative aspect-video rounded-xl overflow-hidden border border-amber-200 group">
          <img src={url} alt="" className="w-full h-full object-cover opacity-70" />
          <span className="absolute bottom-1.5 left-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Under review</span>
          {/* Delete button */}
          <button
            onClick={() => handleDelete(url, 'pending_photos')}
            disabled={deletingUrl === url}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-black/50 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-40"
            title="Remove photo"
          >{deletingUrl === url ? '…' : '✕'}</button>
        </div>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { token } = useParams()

  const [director,    setDirector]   = useState(null)
  const [loading,     setLoading]    = useState(true)
  const [invalid,     setInvalid]    = useState(false)
  const [pending,     setPending]    = useState([])

  // Core fields
  const [attended,    setAttended]    = useState('')
  const [cremation,   setCremation]   = useState('')
  const [phone,       setPhone]       = useState('')
  const [website,     setWebsite]     = useState('')
  const [address,     setAddress]     = useState('')

  // Featured fields
  const [description,   setDescription]   = useState('')
  const [openingHours,  setOpeningHours]  = useState('')
  const [facebookUrl,   setFacebookUrl]   = useState('')
  const [instagramUrl,  setInstagramUrl]  = useState('')
  const [specialOffer,  setSpecialOffer]  = useState('')
  const [showOffer,     setShowOffer]     = useState(false)
  const [specialisms,   setSpecialisms]   = useState([])
  const [faqs,          setFaqs]          = useState([])

  const [saving,     setSaving]     = useState(false)
  const [saveResult, setSaveResult] = useState(null)
  const [upgrading,  setUpgrading]  = useState(false)
  const [upgradeErr, setUpgradeErr] = useState(null)

  useEffect(() => {
    document.title = 'My listing — FuneralFair'
    if (!token) { setInvalid(true); setLoading(false); return }
    fetch(`/api/claim/${token}`)
      .then(r => r.status === 404 ? null : r.json())
      .then(data => {
        if (!data) { setInvalid(true); setLoading(false); return }
        setDirector(data)
        setAttended(fmt(data.attended_price))
        setCremation(fmt(data.cremation_price))
        setPhone(data.phone || '')
        setWebsite(data.website || '')
        setAddress(data.address || '')
        setDescription(data.description || '')
        setOpeningHours(data.opening_hours || '')
        setFacebookUrl(data.facebook_url || '')
        setInstagramUrl(data.instagram_url || '')
        setSpecialOffer(data.special_offer || '')
        setShowOffer(!!(data.special_offer))
        setSpecialisms(data.specialisms || [])
        setFaqs(data.faqs || [])
        setPending(data.pending_photos || [])
        setLoading(false)
      })
      .catch(() => { setInvalid(true); setLoading(false) })
  }, [token])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true); setSaveResult(null)
    try {
      const body = {
        attended_price:  attended  ? parseInt(attended,  10) : null,
        cremation_price: cremation ? parseInt(cremation, 10) : null,
        phone:   phone.trim()   || null,
        website: website.trim() || null,
        address: address.trim() || null,
      }
      if (director.is_featured) {
        body.description   = description.trim()   || null
        body.opening_hours = openingHours.trim()  || null
        body.facebook_url  = facebookUrl.trim()   || null
        body.instagram_url = instagramUrl.trim()  || null
        body.special_offer = (showOffer && specialOffer.trim()) ? specialOffer.trim() : null
        body.specialisms   = specialisms.length ? specialisms : null
        body.faqs          = faqs.filter(f => f.q.trim() && f.a.trim()).length ? faqs.filter(f => f.q.trim() && f.a.trim()) : null
      }
      const res = await fetch(`/api/claim/${token}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      setSaveResult(res.ok ? 'ok' : 'error')
      if (res.ok) setTimeout(() => setSaveResult(null), 4000)
    } catch { setSaveResult('error') }
    finally { setSaving(false) }
  }

  async function handleUpgrade() {
    if (!director?.email || !director?.website) {
      setUpgradeErr('Please add your website before upgrading, or email hello@funeralfair.co.uk.')
      return
    }
    setUpgrading(true); setUpgradeErr(null)
    try {
      const res  = await fetch('/api/create-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: director.name, email: director.email, website: director.website }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) { setUpgradeErr(data.error || 'Something went wrong.'); return }
      window.location.href = data.url
    } catch { setUpgradeErr('Something went wrong — please try again.') }
    finally { setUpgrading(false) }
  }

  function toggleSpecialism(s) {
    setSpecialisms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  function addFaq() {
    if (faqs.length >= 6) return
    setFaqs(prev => [...prev, { q: '', a: '' }])
  }

  function updateFaq(i, field, val) {
    setFaqs(prev => prev.map((f, idx) => idx === i ? { ...f, [field]: val } : f))
  }

  function removeFaq(i) {
    setFaqs(prev => prev.filter((_, idx) => idx !== i))
  }

  const totalPhotos = (director?.photos?.length || 0) + pending.length
  const maxPhotos   = director?.is_featured ? MAX_FEATURED : MAX_FREE
  const atLimit     = totalPhotos >= maxPhotos

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">

        {loading && <Spinner />}

        {!loading && invalid && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-charcoal mb-2">This link isn't valid</h1>
            <p className="text-muted text-sm max-w-xs mx-auto leading-relaxed mb-6">
              The link may be incorrect or outdated. Request a new one below.
            </p>
            <Link
              to="/director-login"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sage hover:bg-sage-dark text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Get a new dashboard link →
            </Link>
          </div>
        )}

        {!loading && director && (
          <div className="flex flex-col gap-5">

            {/* ── Header ── */}
            <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-6 py-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-sage uppercase tracking-widest mb-1">Your listing</p>
                  <h1 className="text-xl font-bold text-charcoal leading-tight">{director.name}</h1>
                  <p className="text-sm text-muted mt-0.5">{director.town}{director.postcode ? `, ${director.postcode}` : ''}</p>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                  {director.is_featured
                    ? <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-sage-light border border-sage-border text-sage"><span className="w-1.5 h-1.5 rounded-full bg-sage" />Featured Partner</span>
                    : <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-cream border border-warm-border text-muted"><span className="w-1.5 h-1.5 rounded-full bg-muted/50" />Free listing</span>}
                  <Link to={`/director/${director.id}`} className="text-xs text-sage hover:underline font-medium">View public listing →</Link>
                </div>
              </div>
            </div>

            {/* ── Stats ── */}
            <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-6 py-5">
              <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">Your listing stats</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold text-charcoal leading-none mb-1">{(director.view_count ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-muted">Profile views</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-charcoal leading-none mb-1">{(director.enquiry_count ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-muted">Enquiries via FuneralFair</p>
                </div>
              </div>
              {!director.is_featured && (
                <div className="mt-4 pt-4 border-t border-warm-border">
                  <p className="text-xs text-muted leading-relaxed">
                    {(director.view_count ?? 0) > 0
                      ? <>You've had <strong className="text-charcoal">{(director.view_count).toLocaleString()} people</strong> view your listing. </>
                      : null}
                    Featured partners appear at the top of search results and get more enquiries.{' '}
                    <Link to="/for-funeral-directors" className="text-sage font-semibold hover:underline">Find out more →</Link>
                  </p>
                </div>
              )}
            </div>

            {/* ── Enquiries ── */}
            <EnquiriesSection token={token} />

            {/* ── Edit listing ── */}
            <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-6 py-5">
              <h2 className="text-base font-semibold text-charcoal mb-1">Edit your listing</h2>
              <p className="text-sm text-muted mb-5">Changes go live immediately.</p>

              <form onSubmit={handleSave} className="flex flex-col gap-5">

                {/* Prices */}
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Prices</p>
                  <div className="flex flex-col gap-4">
                    <PriceInput label="Attended funeral" hint="Your published price for a full attended funeral" value={attended} onChange={setAttended} />
                    <PriceInput label="Direct cremation" hint="Your published price for a direct/unattended cremation" value={cremation} onChange={setCremation} />
                  </div>
                  <p className="text-xs text-muted mt-2 leading-relaxed">Prices must match your Standardised Price List (SPL). Leave blank if not offered.</p>
                </div>

                {/* Contact */}
                <div className="border-t border-warm-border pt-5">
                  <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Contact details</p>
                  <div className="flex flex-col gap-4">
                    <TextInput label="Phone" value={phone} onChange={setPhone} type="tel" placeholder="e.g. 01234 567890" />
                    <TextInput label="Website" value={website} onChange={setWebsite} type="url" placeholder="e.g. https://www.yoursite.co.uk" />
                    <TextInput label="Address" hint="Street address — town and postcode are already on your listing" value={address} onChange={setAddress} placeholder="e.g. 12 High Street" />
                  </div>
                </div>

                {/* Opening hours — featured only */}
                {director.is_featured && (
                  <div className="border-t border-warm-border pt-5">
                    <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Opening hours <span className="normal-case font-normal text-muted">(optional)</span></p>
                    <TextInput label="Hours" hint='e.g. "Mon–Fri 9am–5pm | 24-hour emergency line available"' value={openingHours} onChange={setOpeningHours} placeholder="Mon–Fri 9am–5pm | 24-hour emergency line available" />
                  </div>
                )}

                {/* Social links — featured only */}
                {director.is_featured && (
                  <div className="border-t border-warm-border pt-5">
                    <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Social media <span className="normal-case font-normal text-muted">(optional)</span></p>
                    <div className="flex flex-col gap-4">
                      <TextInput label="Facebook page URL" value={facebookUrl} onChange={setFacebookUrl} type="url" placeholder="https://www.facebook.com/yourpage" />
                      <TextInput label="Instagram profile URL" value={instagramUrl} onChange={setInstagramUrl} type="url" placeholder="https://www.instagram.com/yourprofile" />
                    </div>
                  </div>
                )}

                {/* Description — featured only */}
                {director.is_featured && (
                  <div className="border-t border-warm-border pt-5">
                    <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-1">About your business <span className="normal-case font-normal text-muted">(optional)</span></p>
                    <p className="text-xs text-muted mb-3">Shown on your public listing. Tell families about your history, values and what sets you apart.</p>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={1000} rows={4}
                      placeholder="e.g. We are a family-run funeral directors with over 40 years of experience…"
                      className="w-full px-4 py-3 rounded-xl border border-warm-border bg-cream text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-sage resize-none" />
                    <p className="text-xs text-muted mt-1 text-right">{description.length}/1000</p>
                  </div>
                )}

                {/* Save button */}
                <div className="flex items-center gap-3 pt-1 border-t border-warm-border">
                  <button type="submit" disabled={saving}
                    className="px-6 py-3 bg-sage hover:bg-sage-dark disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm">
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                  {saveResult === 'ok' && (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-sage">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      Saved
                    </span>
                  )}
                  {saveResult === 'error' && <span className="text-sm text-red-600">Something went wrong — try again.</span>}
                </div>
              </form>
            </div>

            {/* ── Special offer ── */}
            {director.is_featured ? (
              <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-6 py-5">
                <div className="flex items-center justify-between mb-1">
                  <SectionHeader title="Special offer" />
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showOffer}
                    onClick={() => setShowOffer(v => !v)}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-1 ${showOffer ? 'bg-sage' : 'bg-warm-border'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${showOffer ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <p className="text-sm text-muted mb-4">An optional highlighted message shown on your public listing.</p>
                {showOffer && (
                  <>
                    <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">Quick picks</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                      {OFFER_PRESETS.map(preset => (
                        <button key={preset} type="button" onClick={() => setSpecialOffer(preset)}
                          className={`text-left text-xs px-3 py-2.5 rounded-lg border transition-colors leading-relaxed ${specialOffer === preset ? 'border-sage bg-sage-light text-sage font-semibold' : 'border-warm-border text-muted hover:border-sage hover:text-charcoal'}`}>
                          {preset}
                        </button>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">Or write your own</p>
                      <input type="text" value={specialOffer} onChange={e => setSpecialOffer(e.target.value)} maxLength={200}
                        placeholder="e.g. Free dignified transfer within 20 miles this month"
                        className="w-full px-4 py-3 rounded-xl border border-warm-border bg-cream text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-sage" />
                      <p className="text-xs text-muted mt-1 text-right">{specialOffer.length}/200</p>
                    </div>
                    <button type="button" onClick={handleSave} disabled={saving}
                      className="mt-3 px-5 py-2.5 bg-sage hover:bg-sage-dark disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors">
                      {saving ? 'Saving…' : 'Save changes'}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-6 py-5">
                <SectionHeader title="Special offer" badge="Featured only" />
                <p className="text-sm text-muted mt-1 mb-3">Add a highlighted promotional message to your listing — "Free home visit", "No hidden fees" and more, or write your own.</p>
                <LockedFeature title="Highlight a special offer" description="Choose from preset offers or write your own. Shown as a prominent banner on your listing." onUpgrade={handleUpgrade} />
              </div>
            )}

            {/* ── Specialisms ── */}
            {director.is_featured ? (
              <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-6 py-5">
                <SectionHeader title="Services & specialisms" />
                <p className="text-sm text-muted mt-1 mb-4">Select all that apply — shown as tags on your listing to help families find the right director.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SPECIALISMS.map(s => {
                    const checked = specialisms.includes(s)
                    return (
                      <label key={s} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${checked ? 'border-sage bg-sage-light' : 'border-warm-border hover:border-sage/50'}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleSpecialism(s)} className="sr-only" />
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-sage border-sage' : 'border-warm-border'}`}>
                          {checked && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                        </div>
                        <span className="text-sm text-charcoal">{s}</span>
                      </label>
                    )
                  })}
                </div>
                <button type="button" onClick={handleSave} disabled={saving}
                  className="mt-4 px-5 py-2.5 bg-sage hover:bg-sage-dark disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors">
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-6 py-5">
                <SectionHeader title="Services & specialisms" badge="Featured only" />
                <p className="text-sm text-muted mt-1 mb-3">Tag your specialisms — natural burial, repatriation, Islamic funerals, pre-paid plans and more — so families searching for specific services can find you.</p>
                <LockedFeature title="Add services & specialisms" description="15 specialist tags to choose from. Shown prominently on your listing and helps families find the right director for their needs." onUpgrade={handleUpgrade} />
              </div>
            )}

            {/* ── FAQs ── */}
            {director.is_featured ? (
              <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-6 py-5">
                <SectionHeader title="Frequently asked questions" />
                <p className="text-sm text-muted mt-1 mb-4">Up to 6 Q&As shown on your listing. Help families understand your service before they get in touch.</p>
                <div className="flex flex-col gap-3">
                  {faqs.map((faq, i) => (
                    <div key={i} className="relative flex flex-col gap-2 p-4 bg-cream border border-warm-border rounded-xl">
                      <button type="button" onClick={() => removeFaq(i)}
                        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full text-muted hover:text-red-500 hover:bg-red-50 transition-colors text-lg leading-none">×</button>
                      <input type="text" value={faq.q} onChange={e => updateFaq(i, 'q', e.target.value)} maxLength={200}
                        placeholder="Question (e.g. Do you offer a 24-hour service?)"
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-sage" />
                      <textarea value={faq.a} onChange={e => updateFaq(i, 'a', e.target.value)} maxLength={500} rows={3}
                        placeholder="Answer…"
                        className="w-full px-3 py-2 rounded-lg border border-warm-border bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-sage resize-none" />
                    </div>
                  ))}
                  {faqs.length < 6 && (
                    <button type="button" onClick={addFaq}
                      className="flex items-center gap-2 text-sm text-sage hover:text-sage-dark font-medium transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                      Add a question {faqs.length > 0 && `(${faqs.length}/6)`}
                    </button>
                  )}
                </div>
                {faqs.length > 0 && (
                  <button type="button" onClick={handleSave} disabled={saving}
                    className="mt-4 px-5 py-2.5 bg-sage hover:bg-sage-dark disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors">
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-6 py-5">
                <SectionHeader title="Frequently asked questions" badge="Featured only" />
                <p className="text-sm text-muted mt-1 mb-3">Add up to 6 Q&As to your listing. Families who find their questions answered are far more likely to get in touch.</p>
                <LockedFeature title="Add FAQs to your listing" description='e.g. "Do you offer home visits?", "What is included in your attended funeral price?" — up to 6 questions.' onUpgrade={handleUpgrade} />
              </div>
            )}

            {/* ── Photos ── */}
            <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-6 py-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-semibold text-charcoal">Photos</h2>
                <span className="text-xs text-muted">{totalPhotos}/{maxPhotos} used</span>
              </div>
              <p className="text-sm text-muted mb-4">
                {director.is_featured
                  ? 'Up to 10 photos — reviewed before going live (usually a few hours).'
                  : 'Free listings include 1 photo. Upgrade to Featured for up to 10.'}
              </p>
              {!atLimit && <PhotoUpload token={token} onUploaded={url => setPending(p => [...p, url])} />}
              {atLimit && director.is_featured && (
                <p className="text-sm text-muted text-center py-3 bg-cream rounded-xl border border-warm-border">
                  You've reached the 10 photo limit. Remove a photo to upload another.
                </p>
              )}
              <PhotoGrid
                photos={director.photos}
                pending={pending}
                token={token}
                onPhotosChange={newPhotos => setDirector(d => ({ ...d, photos: newPhotos }))}
                onPendingChange={setPending}
              />
              {!director.photos?.length && !pending.length && !atLimit && (
                <p className="text-sm text-muted text-center py-3">No photos yet — upload your first one above.</p>
              )}
              {!director.is_featured && (
                <div className="mt-4">
                  <LockedFeature title="Upload up to 10 photos" description="Listings with multiple photos get significantly more enquiries. Show families your chapel of rest, premises and team." onUpgrade={handleUpgrade} />
                </div>
              )}
            </div>

            {/* ── Featured upgrade card (free only) ── */}
            {!director.is_featured && (
              <div className="bg-white rounded-2xl border-2 border-sage shadow-sm px-6 py-6">
                <span className="inline-flex text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sage text-white mb-3">Featured listing</span>
                <h2 className="text-lg font-bold text-charcoal mb-1">Stand out from the crowd</h2>
                <p className="text-sm text-muted mb-4">Everything in your free listing, plus:</p>
                <ul className="flex flex-col gap-2.5 mb-5">
                  {[
                    'Top of search results in your area',
                    'Up to 10 photos — show your premises and team',
                    'Business description on your listing',
                    'Special offer banner — promote deals and services',
                    'Services & specialisms tags',
                    'FAQ section — answer families\' questions upfront',
                    '"Featured" badge — builds trust instantly',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-charcoal">
                      <svg className="w-4 h-4 text-sage shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <button onClick={handleUpgrade} disabled={upgrading}
                    className="px-6 py-3 bg-sage hover:bg-sage-dark disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-colors shadow-sm">
                    {upgrading ? 'Redirecting…' : 'Upgrade to Featured →'}
                  </button>
                  <span className="text-sm text-muted">£49/month · Cancel anytime</span>
                </div>
                {upgradeErr && <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{upgradeErr}</p>}
              </div>
            )}

            {/* ── Help ── */}
            <div className="rounded-xl border border-warm-border bg-white px-5 py-4">
              <p className="text-sm text-muted">
                Need to change your name, town or postcode?{' '}
                <a href="mailto:hello@funeralfair.co.uk" className="text-sage hover:underline font-medium">Email hello@funeralfair.co.uk</a>
              </p>
            </div>

          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
