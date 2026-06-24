import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function formatPrice(val) {
  if (val == null || val === '') return ''
  const n = Number(val)
  return isNaN(n) ? '' : String(n)
}

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
        <input
          type="number"
          min="100"
          max="50000"
          step="1"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="e.g. 3200"
          className="w-full pl-8 pr-4 py-3 rounded-xl border border-warm-border bg-cream text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-sage"
        />
      </div>
    </div>
  )
}

function TextInput({ label, hint, value, onChange, type = 'text', placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-charcoal uppercase tracking-wide">{label}</label>
      {hint && <p className="text-xs text-muted -mt-0.5">{hint}</p>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-warm-border bg-cream text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-sage"
      />
    </div>
  )
}

function PhotoUpload({ token, onUploaded }) {
  const [dragging,  setDragging]  = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState(null)
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
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current.click()}
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-8 py-8 cursor-pointer transition-colors ${dragging ? 'border-sage bg-sage-light' : 'border-warm-border hover:border-sage hover:bg-sage-light/40'} ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
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
            </>
        }
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={e => upload(e.target.files[0])} />
      </div>
      {error && <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>}
    </div>
  )
}

export default function ClaimListing() {
  const { token } = useParams()

  const [director, setDirector] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [invalid,  setInvalid]  = useState(false)

  // Form state
  const [attendedPrice,  setAttendedPrice]  = useState('')
  const [cremationPrice, setCremationPrice] = useState('')
  const [phone,          setPhone]          = useState('')
  const [website,        setWebsite]        = useState('')
  const [address,        setAddress]        = useState('')

  const [uploadedPhoto, setUploadedPhoto] = useState(null)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [success,    setSuccess]    = useState(false)

  useEffect(() => {
    document.title = 'Claim your listing — FuneralFair'
    if (!token) { setInvalid(true); setLoading(false); return }

    fetch(`/api/claim/${token}`)
      .then(r => {
        if (r.status === 404) { setInvalid(true); setLoading(false); return null }
        return r.json()
      })
      .then(data => {
        if (!data) return
        setDirector(data)
        setAttendedPrice(formatPrice(data.attended_price))
        setCremationPrice(formatPrice(data.cremation_price))
        setPhone(data.phone || '')
        setWebsite(data.website || '')
        setAddress(data.address || '')
        setLoading(false)
      })
      .catch(() => { setInvalid(true); setLoading(false) })
  }, [token])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError(null)
    setSubmitting(true)

    const body = {
      attended_price:  attendedPrice  ? parseInt(attendedPrice,  10) : null,
      cremation_price: cremationPrice ? parseInt(cremationPrice, 10) : null,
      phone:   phone.trim()   || null,
      website: website.trim() || null,
      address: address.trim() || null,
    }

    try {
      const res = await fetch(`/api/claim/${token}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setSubmitError(err.error || 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }
      setSuccess(true)
    } catch {
      setSubmitError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16">

        {loading && <Spinner />}

        {/* Invalid token */}
        {!loading && invalid && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-charcoal mb-2">This link is no longer valid</h1>
            <p className="text-muted text-sm max-w-xs mx-auto leading-relaxed">
              This claim link may have already been used or it may be incorrect. Contact us at{' '}
              <a href="mailto:hello@funeralfair.co.uk" className="text-sage underline">hello@funeralfair.co.uk</a>
              {' '}if you need help.
            </p>
          </div>
        )}

        {/* Success */}
        {!loading && success && director && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-sage-light border border-sage-border flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-sage" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-charcoal mb-2">Listing updated</h1>
            <p className="text-muted text-sm max-w-xs mx-auto leading-relaxed mb-8">
              Your changes are live. You can manage your listing, add photos and more from your dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={`/dashboard/${token}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-sage hover:bg-sage-dark text-white font-semibold rounded-xl text-sm transition-colors"
              >
                Go to my dashboard →
              </Link>
              <Link
                to={`/director/${director.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-warm-border hover:border-sage text-charcoal font-semibold rounded-xl text-sm transition-colors"
              >
                View your listing
              </Link>
            </div>
          </div>
        )}

        {/* Claim form */}
        {!loading && !invalid && !success && director && (
          <div>
            {/* Header */}
            <div className="mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-light border border-sage-border text-sage text-xs font-semibold tracking-widest uppercase mb-4">
                Free listing
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-charcoal leading-tight mb-2">
                {director.claimed_at ? 'Update your listing' : 'Claim your listing'}
              </h1>
              <p className="text-muted text-sm leading-relaxed">
                You're {director.claimed_at ? 'updating' : 'claiming'} <strong className="text-charcoal">{director.name}</strong>
                {director.town ? ` in ${director.town}` : ''}.
                Update your prices and contact details below — changes go live immediately.
              </p>
            </div>

            {/* Already claimed notice */}
            {director.claimed_at && (
              <div className="mb-6 flex items-start gap-3 bg-sage-light border border-sage-border rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-sage shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
                <p className="text-xs text-sage leading-relaxed">
                  This listing was previously claimed on{' '}
                  {new Date(director.claimed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.
                  You can update it again below.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

              {/* Read-only info */}
              <div className="bg-white border border-warm-border rounded-2xl p-5">
                <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Your business</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted mb-0.5">Name</p>
                    <p className="text-sm font-semibold text-charcoal">{director.name}</p>
                  </div>
                  {director.town && (
                    <div>
                      <p className="text-xs text-muted mb-0.5">Town</p>
                      <p className="text-sm font-semibold text-charcoal">{director.town}</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted mt-3 leading-relaxed">
                  Name and town can't be changed here. Email{' '}
                  <a href="mailto:hello@funeralfair.co.uk" className="text-sage underline">hello@funeralfair.co.uk</a>
                  {' '}if something needs correcting.
                </p>
              </div>

              {/* Prices */}
              <div className="bg-white border border-warm-border rounded-2xl p-5 flex flex-col gap-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-widest">Prices</p>
                <div>
                  <PriceInput
                    label="Attended funeral"
                    hint="Your published price for a full attended funeral with mourners present"
                    value={attendedPrice}
                    onChange={setAttendedPrice}
                  />
                  {!attendedPrice && (
                    <p className="mt-1.5 text-xs text-muted italic">Not currently on your listing — add it above</p>
                  )}
                </div>
                <div>
                  <PriceInput
                    label="Direct cremation"
                    hint="Your published price for a direct/unattended cremation"
                    value={cremationPrice}
                    onChange={setCremationPrice}
                  />
                  {!cremationPrice && (
                    <p className="mt-1.5 text-xs text-muted italic">Not currently on your listing — add it above</p>
                  )}
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Prices must match your published Standardised Price List (SPL). Leave blank if you don't offer that service.
                </p>
              </div>

              {/* Contact details */}
              <div className="bg-white border border-warm-border rounded-2xl p-5 flex flex-col gap-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-widest">Contact details</p>
                <TextInput
                  label="Phone number"
                  value={phone}
                  onChange={setPhone}
                  type="tel"
                  placeholder="e.g. 01234 567890"
                />
                <div>
                  <TextInput
                    label="Website"
                    value={website}
                    onChange={setWebsite}
                    type="url"
                    placeholder="e.g. https://www.yoursite.co.uk"
                  />
                  {!website && (
                    <p className="mt-1.5 text-xs text-muted italic">Not currently on your listing — add it above</p>
                  )}
                </div>
                <TextInput
                  label="Address"
                  hint="Street address — town and postcode are already on your listing"
                  value={address}
                  onChange={setAddress}
                  placeholder="e.g. 12 High Street"
                />
              </div>

              {/* Photo */}
              <div className="bg-white border border-warm-border rounded-2xl p-5 flex flex-col gap-3">
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-1">Photo</p>
                  <p className="text-xs text-muted leading-relaxed">Add a photo of your premises or team. It'll be reviewed before going live.</p>
                </div>
                {uploadedPhoto ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-amber-200">
                    <img src={uploadedPhoto} alt="" className="w-full h-full object-cover opacity-80" />
                    <span className="absolute bottom-1.5 left-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Under review</span>
                  </div>
                ) : (
                  <PhotoUpload token={token} onUploaded={url => setUploadedPhoto(url)} />
                )}
              </div>

              {submitError && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-sage hover:bg-sage-dark disabled:opacity-60 text-white font-bold rounded-xl text-base transition-colors shadow-sm"
                style={{ touchAction: 'manipulation' }}
              >
                {submitting ? 'Saving…' : 'Update my listing'}
              </button>

              <p className="text-xs text-muted text-center leading-relaxed">
                Changes go live immediately. Your listing on FuneralFair is always free.{' '}
                <a href="mailto:hello@funeralfair.co.uk" className="underline underline-offset-2 hover:text-charcoal">
                  Contact us
                </a>
                {' '}if you'd like to be removed.
              </p>

            </form>
          </div>
        )}

      </main>

      <Footer />
    </div>
  )
}
