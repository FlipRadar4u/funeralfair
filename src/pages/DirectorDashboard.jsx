import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Spinner() {
  return (
    <div className="flex justify-center py-32">
      <div className="w-9 h-9 rounded-full border-2 border-sage animate-spin" style={{ borderTopColor: 'transparent' }} />
    </div>
  )
}

function StatusBadge({ isFeatured, needsReview }) {
  if (needsReview) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        Under review
      </span>
    )
  }
  if (isFeatured) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-sage-light border border-sage-border text-sage">
        <span className="w-1.5 h-1.5 rounded-full bg-sage" />
        Live — Featured Partner
      </span>
    )
  }
  return null
}

function PhotoUpload({ token, onUploaded }) {
  const [dragging, setDragging]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState(null)
  const inputRef                  = useRef(null)

  async function upload(file) {
    if (!file) return
    setError(null)
    setUploading(true)
    const fd = new FormData()
    fd.append('token', token)
    fd.append('file', file)
    try {
      const res  = await fetch('/api/director/upload-photo', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Upload failed'); return }
      onUploaded(data.url)
    } catch {
      setError('Upload failed — please try again')
    } finally {
      setUploading(false)
    }
  }

  const onDrop = useCallback(e => {
    e.preventDefault()
    setDragging(false)
    upload(e.dataTransfer.files[0])
  }, [token])

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current.click()}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-8 py-10 cursor-pointer transition-colors ${
          dragging ? 'border-sage bg-sage-light' : 'border-warm-border hover:border-sage hover:bg-sage-light/40'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        {uploading ? (
          <>
            <div className="w-7 h-7 rounded-full border-2 border-sage animate-spin" style={{ borderTopColor: 'transparent' }} />
            <p className="text-sm text-muted">Uploading…</p>
          </>
        ) : (
          <>
            <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            <div className="text-center">
              <p className="text-sm font-medium text-charcoal">Drag a photo here, or click to browse</p>
              <p className="text-xs text-muted mt-1">JPEG, PNG or WebP · max 8 MB</p>
            </div>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
          onChange={e => upload(e.target.files[0])} />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>
      )}
    </div>
  )
}

function PhotoGrid({ photos, pending }) {
  if (!photos?.length && !pending?.length) return null
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {(photos || []).map((url, i) => (
        <div key={`a-${i}`} className="relative aspect-video rounded-xl overflow-hidden border border-warm-border">
          <img src={url} alt="" className="w-full h-full object-cover" />
          <span className="absolute bottom-1.5 left-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sage text-white">Live</span>
        </div>
      ))}
      {(pending || []).map((url, i) => (
        <div key={`p-${i}`} className="relative aspect-video rounded-xl overflow-hidden border border-amber-200">
          <img src={url} alt="" className="w-full h-full object-cover opacity-70" />
          <span className="absolute bottom-1.5 left-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Awaiting approval</span>
        </div>
      ))}
    </div>
  )
}

export default function DirectorDashboard() {
  const [params]                    = useSearchParams()
  const token                       = params.get('token')
  const [director, setDirector]     = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [pendingPhotos, setPending] = useState([])

  useEffect(() => {
    if (!token) { setError('No access link provided.'); setLoading(false); return }
    fetch(`/api/director/auth?token=${encodeURIComponent(token)}`)
      .then(r => r.ok ? r.json() : r.json().then(d => Promise.reject(d.error)))
      .then(data => {
        setDirector(data)
        setPending(data.pending_photos || [])
        setLoading(false)
      })
      .catch(err => { setError(err || 'Invalid or expired link.'); setLoading(false) })
  }, [token])

  function onUploaded(url) {
    setPending(p => [...p, url])
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">Director dashboard</h1>
          <p className="text-muted mt-1.5 text-sm">Manage your FuneralFair listing</p>
        </div>

        {loading && <Spinner />}

        {!loading && error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-6 py-8 text-center">
            <p className="text-red-700 font-medium mb-1">Link not recognised</p>
            <p className="text-sm text-red-600">{error}</p>
            <p className="text-sm text-muted mt-4">
              If you've lost your dashboard link, email{' '}
              <a href="mailto:hello@funeralfair.co.uk" className="text-sage hover:underline">hello@funeralfair.co.uk</a>{' '}
              and we'll resend it.
            </p>
          </div>
        )}

        {!loading && director && (
          <div className="flex flex-col gap-5">

            {/* Listing overview */}
            <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-7 py-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-charcoal">{director.name}</h2>
                  <p className="text-sm text-muted mt-0.5">
                    {director.town}{director.postcode ? `, ${director.postcode}` : ''}
                  </p>
                  {director.website && (
                    <a href={director.website} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-sage hover:underline mt-1 inline-block">
                      {director.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
                <StatusBadge isFeatured={director.is_featured} needsReview={director.needs_review} />
              </div>

              {director.needs_review && (
                <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3.5 text-sm text-amber-800">
                  <p className="font-semibold mb-1">Verification in progress</p>
                  <p>We're verifying your listing before it goes live. This usually takes less than 24 hours. You'll receive an email once it's approved.</p>
                </div>
              )}
            </div>

            {/* Photos */}
            <div className="bg-white rounded-2xl border border-warm-border shadow-sm px-7 py-6">
              <h2 className="text-base font-semibold text-charcoal mb-0.5">Photos</h2>
              <p className="text-sm text-muted mb-5">
                Add photos of your chapel of rest, premises and staff. Each photo is reviewed before going live — usually within a few hours.
              </p>

              <div className="flex flex-col gap-5">
                <PhotoUpload token={token} onUploaded={onUploaded} />
                <PhotoGrid
                  photos={director.photos}
                  pending={pendingPhotos}
                />
                {!director.photos?.length && !pendingPhotos.length && (
                  <p className="text-sm text-muted text-center py-2">No photos yet — upload your first one above.</p>
                )}
              </div>
            </div>

            {/* Help */}
            <div className="rounded-xl border border-warm-border bg-white px-5 py-4">
              <p className="text-sm text-muted">
                Need help or want to update your details?{' '}
                <a href="mailto:hello@funeralfair.co.uk" className="text-sage hover:underline font-medium">
                  Email hello@funeralfair.co.uk
                </a>
              </p>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
