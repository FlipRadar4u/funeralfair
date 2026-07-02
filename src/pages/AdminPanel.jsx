import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmt(v) {
  if (v == null) return '—'
  const n = Number(v)
  return isNaN(n) ? '—' : `£${n.toLocaleString('en-GB')}`
}

function pct(n, total) {
  if (!total) return '0%'
  return `${Math.round((n / total) * 100)}%`
}

function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-sage animate-spin" style={{ borderTopColor: 'transparent' }} />
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`bg-white rounded-2xl border p-5 shadow-sm ${accent ? 'border-sage' : 'border-warm-border'}`}>
      <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-3xl font-bold leading-none mb-1 ${accent ? 'text-sage' : 'text-charcoal'}`}>{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  )
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

function EditModal({ director, pw, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    name:            director.name            ?? '',
    town:            director.town            ?? '',
    postcode:        director.postcode        ?? '',
    website:         director.website         ?? '',
    attended_price:  director.attended_price  ?? '',
    cremation_price: director.cremation_price ?? '',
    nafd_member:     !!director.nafd_member,
    saif_member:     !!director.saif_member,
    is_featured:     !!director.is_featured,
  })
  const [saving,         setSaving]        = useState(false)
  const [error,          setError]         = useState(null)
  const [confirmDelete,  setConfirmDelete] = useState(false)
  const [deleting,       setDeleting]      = useState(false)

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/admin/delete-director?pw=${encodeURIComponent(pw)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: director.id }),
    })
    if (res.ok) { onDelete(director.id); onClose() }
    else { setError('Delete failed.'); setDeleting(false); setConfirmDelete(false) }
  }

  async function save() {
    setSaving(true)
    setError(null)
    const payload = {
      ...form,
      attended_price:  form.attended_price  === '' ? null : Math.round(Number(form.attended_price)),
      cremation_price: form.cremation_price === '' ? null : Math.round(Number(form.cremation_price)),
    }
    const res = await fetch(`/api/admin/update-director?pw=${encodeURIComponent(pw)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: director.id, ...payload }),
    })
    if (!res.ok) {
      const errData = await res.json().catch(() => null)
      setError(errData?.message || errData?.error || `Save failed (${res.status})`)
      setSaving(false)
      return
    }
    onSave({ ...director, ...payload })
    onClose()
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '520px',
          maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          display: 'flex', flexDirection: 'column',
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #e5e0d8' }}>
          <div>
            <p style={{ fontWeight: 700, color: '#1a1a1a', fontSize: '15px' }}>Edit director</p>
            <p style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{director.name}</p>
          </div>
          <button
            onClick={onClose}
            style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #e5e0d8', background: '#f7f4f0', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Claimed status */}
          {director.claimed_at ? (
            <div style={{ background: '#edf3ee', border: '1px solid #c5d9c7', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#4d7a51', textTransform: 'uppercase', letterSpacing: '1px' }}>✓ Listing claimed</p>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#2c2c2c' }}>
                  {new Date(director.claimed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {director.claim_token && (
                <a href={`/dashboard/${director.claim_token}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '12px', fontWeight: 600, color: '#4d7a51', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  View dashboard →
                </a>
              )}
            </div>
          ) : (
            <div style={{ background: '#faf8f6', border: '1px solid #e8e2db', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#9c968f', textTransform: 'uppercase', letterSpacing: '1px' }}>Not yet claimed</p>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6b6560' }}>This director hasn't claimed their listing yet.</p>
              </div>
              {director.claim_token && (
                <a href={`/claim/${director.claim_token}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '12px', fontWeight: 600, color: '#4d7a51', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  View claim page →
                </a>
              )}
            </div>
          )}

          {/* Toggles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { key: 'is_featured', label: 'Featured partner' },
              { key: 'nafd_member', label: 'NAFD member' },
              { key: 'saif_member', label: 'SAIF member' },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setField(key, !form[key])}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                  borderRadius: '10px', border: `2px solid ${form[key] ? '#4d7a51' : '#e5e0d8'}`,
                  background: form[key] ? '#edf3ee' : '#fff', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: '36px', height: '20px', borderRadius: '10px', position: 'relative', flexShrink: 0,
                  background: form[key] ? '#4d7a51' : '#ccc', transition: 'background 0.15s',
                }}>
                  <div style={{
                    position: 'absolute', top: '2px', left: form[key] ? '18px' : '2px',
                    width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.15s',
                  }} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>{label}</span>
              </button>
            ))}
          </div>

          {/* Prices */}
          {director.manually_checked && (
            <div style={{ background: '#edf3ee', border: '1px solid #c5d9c7', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#4d7a51', fontWeight: 600 }}>
              ✓ Prices verified by researcher
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <InlineField label="Attended price (£)" value={form.attended_price} onChange={v => setField('attended_price', v)} type="number" />
            <InlineField label="Cremation price (£)" value={form.cremation_price} onChange={v => setField('cremation_price', v)} type="number" />
          </div>

          {/* Details */}
          <InlineField label="Name" value={form.name} onChange={v => setField('name', v)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <InlineField label="Town" value={form.town} onChange={v => setField('town', v)} />
            <InlineField label="Postcode" value={form.postcode} onChange={v => setField('postcode', v)} />
          </div>
          <InlineField label="Website" value={form.website} onChange={v => setField('website', v)} />

          {error && <p style={{ fontSize: '13px', color: '#dc2626' }}>{error}</p>}

          {/* Delete */}
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              style={{ fontSize: '12px', color: '#dc2626', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
            >
              Delete this director
            </button>
          ) : (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 14px' }}>
              <p style={{ fontSize: '13px', color: '#dc2626', marginBottom: '10px', fontWeight: 600 }}>Permanently delete this listing?</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{ padding: '7px 14px', background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: '13px', borderRadius: '8px', border: 'none', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1 }}
                >
                  {deleting ? 'Deleting…' : 'Yes, delete'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{ padding: '7px 14px', background: '#fff', border: '1px solid #e5e0d8', fontSize: '13px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e0d8', display: 'flex', gap: '10px' }}>
          <button
            onClick={save}
            disabled={saving}
            style={{
              flex: 1, padding: '11px', background: saving ? '#aaa' : '#4d7a51', color: '#fff',
              fontWeight: 700, fontSize: '14px', borderRadius: '10px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button
            onClick={onClose}
            style={{ padding: '11px 20px', borderRadius: '10px', border: '1px solid #e5e0d8', background: '#fff', cursor: 'pointer', fontSize: '14px', color: '#1a1a1a' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

function InlineField({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#888', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <input
        type={type}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e5e0d8',
          fontSize: '14px', color: '#1a1a1a', background: '#f7f4f0', boxSizing: 'border-box',
          outline: 'none',
        }}
        onFocus={e => e.target.style.borderColor = '#4d7a51'}
        onBlur={e => e.target.style.borderColor = '#e5e0d8'}
      />
    </div>
  )
}


// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ directors }) {
  const total          = directors.length
  const withAttended   = directors.filter(d => d.attended_price  != null).length
  const withCremation  = directors.filter(d => d.cremation_price != null).length
  const withBoth       = directors.filter(d => d.attended_price  != null && d.cremation_price != null).length
  const withNeither    = directors.filter(d => d.attended_price  == null && d.cremation_price == null).length
  const featured       = directors.filter(d => d.is_featured).length
  const nafd           = directors.filter(d => d.nafd_member).length
  const saif           = directors.filter(d => d.saif_member).length
  // verified field deprecated — replaced by claimed_at indicator in edit modal
  const withEmail        = directors.filter(d => d.email).length
  const withGoogleRating = directors.filter(d => d.google_rating != null).length
  const researcherVerified = directors.filter(d => d.manually_checked).length
  const claimed        = directors.filter(d => d.claimed_at).length
  const emailsSent     = directors.filter(d => d.claim_email_sent_at).length

  return (
    <div className="space-y-6">
      {/* Primary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total directors" value={total.toLocaleString()} accent />
        <StatCard label="Featured partners" value={featured} sub={featured === 0 ? 'None yet' : `${pct(featured, total)} of total`} />
        <StatCard label="NAFD members" value={nafd.toLocaleString()} sub={pct(nafd, total)} />
        <StatCard label="SAIF members" value={saif.toLocaleString()} sub={pct(saif, total)} />
      </div>

      {/* Data quality */}
      <div>
        <h3 className="text-sm font-bold text-charcoal mb-3">Data quality</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="With attended price" value={withAttended.toLocaleString()} sub={pct(withAttended, total)} />
          <StatCard label="With cremation price" value={withCremation.toLocaleString()} sub={pct(withCremation, total)} />
          <StatCard label="Both prices listed" value={withBoth.toLocaleString()} sub={pct(withBoth, total)} />
          <StatCard label="Missing all prices" value={withNeither.toLocaleString()} sub={`${pct(withNeither, total)} need data`} />
          <StatCard label="Researcher verified" value={researcherVerified.toLocaleString()} sub={pct(researcherVerified, total) + ' of total'} accent />
          <StatCard label="Google ratings" value={withGoogleRating.toLocaleString()} sub={withGoogleRating === 0 ? 'Run enrichment script' : pct(withGoogleRating, total)} />
        </div>
      </div>

      {/* Outreach stats */}
      <div>
        <h3 className="text-sm font-bold text-charcoal mb-3">Claim outreach</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Emails sent" value={emailsSent.toLocaleString()} sub={pct(emailsSent, total)} />
          <StatCard label="Listings claimed" value={claimed.toLocaleString()} sub={emailsSent ? `${pct(claimed, emailsSent)} of emails sent` : '—'} accent />
          <StatCard label="With email" value={withEmail.toLocaleString()} sub={pct(withEmail, total)} />
          <StatCard label="No email" value={(total - withEmail).toLocaleString()} sub="can't be emailed" />
        </div>
      </div>

      {/* CMA compliance */}
      {(() => {
        const noPricesPct = pct(withNeither, total)
        return (
          <div className="bg-white rounded-2xl border border-warm-border p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-bold text-charcoal">CMA price transparency</h3>
                <p className="text-xs text-muted mt-0.5">UK funeral directors are legally required to publish a Standard Price List (SPL) online under CMA rules introduced Sept 2021.</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-2xl font-bold text-red-500">{noPricesPct}</p>
                <p className="text-xs text-muted">publishing no prices</p>
              </div>
            </div>

            {/* Incomplete data warning */}
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
              <span className="text-amber-500 text-base mt-0.5 shrink-0">⚠</span>
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>Data incomplete.</strong> These figures include directors not yet checked by the researcher — a missing price may mean it hasn't been scraped yet, not that it doesn't exist. The CMA stats and story angle below will only be reliable once all batches are complete. <strong>{researcherVerified.toLocaleString()} of {total.toLocaleString()} directors with prices confirmed so far ({pct(researcherVerified, total)}).</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-red-500">{withNeither.toLocaleString()}</p>
                <p className="text-xs text-muted mt-0.5">No prices at all</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-amber-600">{(total - withAttended).toLocaleString()}</p>
                <p className="text-xs text-muted mt-0.5">Missing attended price</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-amber-600">{(total - withCremation).toLocaleString()}</p>
                <p className="text-xs text-muted mt-0.5">Missing cremation price</p>
              </div>
              <div className="bg-sage/10 border border-sage/20 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-sage">{withBoth.toLocaleString()}</p>
                <p className="text-xs text-muted mt-0.5">Both prices listed</p>
              </div>
            </div>
            <div className="bg-cream rounded-xl p-3 border border-warm-border opacity-50">
              <p className="text-xs text-muted leading-relaxed">
                <strong className="text-charcoal">Story angle (incomplete — revisit when all batches done):</strong> "{noPricesPct} of UK funeral directors are not publishing any prices online — potentially breaking CMA price transparency rules that came into force in September 2021. Of {total.toLocaleString()} directors surveyed, {withNeither.toLocaleString()} showed no Standard Price List on their website."
              </p>
            </div>
          </div>
        )
      })()}

      {/* Progress bars */}
      <div className="bg-white rounded-2xl border border-warm-border p-5 shadow-sm">
        <h3 className="text-sm font-bold text-charcoal mb-4">Coverage</h3>
        <div className="space-y-4">
          {[
            { label: 'Directors with attended price', n: withAttended, total },
            { label: 'Directors with cremation price', n: withCremation, total },
            { label: 'Directors with both prices',    n: withBoth,       total },
            { label: 'Directors with Google rating',  n: withGoogleRating, total },
            { label: 'NAFD or SAIF member',           n: directors.filter(d => d.nafd_member || d.saif_member).length, total },
          ].map(({ label, n, total: t }) => (
            <div key={label}>
              <div className="flex justify-between text-xs text-muted mb-1.5">
                <span>{label}</span>
                <span className="font-semibold text-charcoal">{n.toLocaleString()} / {t.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-cream rounded-full border border-warm-border overflow-hidden">
                <div
                  className="h-full bg-sage rounded-full transition-all"
                  style={{ width: `${Math.round((n / t) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Directors tab ────────────────────────────────────────────────────────────

const FILTERS = [
  { id: 'all',      label: 'All' },
  { id: 'claimed',  label: 'Claimed' },
  { id: 'featured', label: 'Featured' },
  { id: 'no-prices', label: 'Missing prices' },
  { id: 'verified', label: 'Verified prices' },
  { id: 'nafd',     label: 'NAFD' },
  { id: 'saif',     label: 'SAIF' },
  { id: 'no-email', label: 'No email' },
]

function DirectorsTab({ directors, pw, onUpdate, onDelete }) {
  const [search,      setSearch]     = useState('')
  const [filter,      setFilter]     = useState('all')
  const [sort,        setSort]       = useState({ col: 'name', dir: 'asc' })
  const [page,        setPage]       = useState(1)
  const [editing,     setEditing]    = useState(null)
  const [toggling,    setToggling]   = useState({})
  const [selected,    setSelected]   = useState(new Set())
  const [bulkWorking, setBulkWorking] = useState(false)
  const PER_PAGE = 50

  async function toggleFeatured(e, d) {
    e.stopPropagation()
    setToggling(t => ({ ...t, [d.id]: true }))
    const res = await fetch(`/api/admin/update-director?pw=${encodeURIComponent(pw)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: d.id, is_featured: !d.is_featured }),
    })
    if (res.ok) onUpdate({ ...d, is_featured: !d.is_featured })
    setToggling(t => ({ ...t, [d.id]: false }))
  }

  async function toggleVerified(e, d) {
    e.stopPropagation()
    setToggling(t => ({ ...t, [`v${d.id}`]: true }))
    try {
      const res = await fetch(`/api/admin/update-director?pw=${encodeURIComponent(pw)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: d.id, manually_checked: !d.manually_checked }),
      })
      if (res.ok) {
        onUpdate({ ...d, manually_checked: !d.manually_checked })
      } else {
        alert(`Failed to update verified status (${res.status})`)
      }
    } catch {
      alert('Network error — verified status not saved')
    } finally {
      setToggling(t => ({ ...t, [`v${d.id}`]: false }))
    }
  }

  function toggleSelect(id) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function toggleSelectAll() {
    const allSelected = pageItems.every(d => selected.has(d.id))
    setSelected(s => {
      const n = new Set(s)
      pageItems.forEach(d => allSelected ? n.delete(d.id) : n.add(d.id))
      return n
    })
  }

  async function bulkUpdate(patch) {
    setBulkWorking(true)
    const ids = [...selected]
    await Promise.all(ids.map(id => {
      const d = directors.find(x => x.id === id)
      return fetch(`/api/admin/update-director?pw=${encodeURIComponent(pw)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...patch }),
      }).then(res => { if (res.ok && d) onUpdate({ ...d, ...patch }) })
    }))
    setSelected(new Set())
    setBulkWorking(false)
  }

  async function bulkDelete() {
    if (!window.confirm(`Delete ${selected.size} director${selected.size !== 1 ? 's' : ''}? This cannot be undone.`)) return
    setBulkWorking(true)
    try {
      const ids = [...selected]
      await Promise.all(ids.map(id =>
        fetch(`/api/admin/delete-director?pw=${encodeURIComponent(pw)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        }).then(res => { if (res.ok) onDelete(id) })
      ))
      setSelected(new Set())
    } finally {
      setBulkWorking(false)
    }
  }

  function bulkExport() {
    const ids     = [...selected]
    const rows    = directors.filter(d => ids.includes(d.id))
    const headers = ['Name', 'Town', 'Postcode', 'Email', 'Phone', 'Website', 'Attended price', 'Cremation price', 'NAFD', 'SAIF', 'Featured', 'Claimed']
    const esc     = s => `"${String(s ?? '').replace(/"/g, '""')}"`
    const lines   = [
      headers.join(','),
      ...rows.map(d => [
        esc(d.name), esc(d.town), d.postcode || '', d.email || '', d.phone || '', d.website || '',
        d.attended_price ?? '', d.cremation_price ?? '',
        d.nafd_member ? 'Yes' : 'No', d.saif_member ? 'Yes' : 'No', d.is_featured ? 'Yes' : 'No',
        d.claimed_at ? new Date(d.claimed_at).toLocaleDateString('en-GB') : '',
      ].join(',')),
    ]
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }))
    Object.assign(document.createElement('a'), {
      href: url, download: `funeralfair-${new Date().toISOString().slice(0, 10)}.csv`,
    }).click()
    URL.revokeObjectURL(url)
  }

  const filtered = useMemo(() => {
    let list = directors
    if (search) {
      const q    = search.toLowerCase()
      const qNoS = q.replace(/\s+/g, '')
      list = list.filter(d =>
        d.name?.toLowerCase().includes(q) ||
        d.town?.toLowerCase().includes(q) ||
        d.postcode?.toLowerCase().includes(q) ||
        (qNoS.length > 2 && d.postcode?.toLowerCase().replace(/\s+/g, '').includes(qNoS))
      )
    }
    if (filter === 'claimed')   list = list.filter(d => d.claimed_at)
    if (filter === 'featured')  list = list.filter(d => d.is_featured)
    if (filter === 'no-prices') list = list.filter(d => d.attended_price == null && d.cremation_price == null)
    if (filter === 'nafd')      list = list.filter(d => d.nafd_member)
    if (filter === 'saif')      list = list.filter(d => d.saif_member)
    if (filter === 'no-email')  list = list.filter(d => !d.email)
    if (filter === 'verified')  list = list.filter(d => d.manually_checked)

    list = [...list].sort((a, b) => {
      let av = a[sort.col], bv = b[sort.col]
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
    })
    return list
  }, [directors, search, filter, sort])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const pageItems  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function toggleSort(col) {
    setSort(s => s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })
    setPage(1)
  }

  function SortBtn({ col, label }) {
    const active = sort.col === col
    return (
      <button onClick={() => toggleSort(col)} className="flex items-center gap-1 hover:text-charcoal transition-colors">
        {label}
        <span className={`text-xs ${active ? 'text-sage' : 'opacity-30'}`}>
          {active && sort.dir === 'asc' ? '↑' : '↓'}
        </span>
      </button>
    )
  }

  return (
    <div>
      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search by name, town, or postcode…"
          className="flex-1 px-4 py-2.5 rounded-xl border border-warm-border bg-white text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-sage"
        />
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => { setFilter(f.id); setPage(1) }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filter === f.id ? 'bg-charcoal text-white border-charcoal' : 'bg-white border-warm-border text-charcoal hover:border-sage'}`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted self-center">{filtered.length.toLocaleString()} results</span>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3 px-4 py-3 bg-charcoal text-white rounded-xl">
          <span className="text-sm font-semibold mr-2">{selected.size} selected</span>
          {[
            { label: '★ Feature',  patch: { is_featured: true } },
            { label: 'Un-feature', patch: { is_featured: false } },
            { label: 'NAFD ✓',     patch: { nafd_member: true } },
            { label: 'Un-NAFD',    patch: { nafd_member: false } },
            { label: 'SAIF ✓',     patch: { saif_member: true } },
            { label: 'Un-SAIF',    patch: { saif_member: false } },
          ].map(({ label, patch }) => (
            <button
              key={label}
              onClick={() => bulkUpdate(patch)}
              disabled={bulkWorking}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-colors"
            >
              {label}
            </button>
          ))}
          <div className="w-px h-4 bg-white/20 mx-1" />
          <button
            onClick={bulkExport}
            disabled={bulkWorking}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={bulkDelete}
            disabled={bulkWorking}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/80 hover:bg-red-500 disabled:opacity-50 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-white/50 hover:text-white transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-warm-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-border bg-cream/60">
                <th className="px-3 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={pageItems.length > 0 && pageItems.every(d => selected.has(d.id))}
                    onChange={toggleSelectAll}
                    className="cursor-pointer"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted">
                  <SortBtn col="name" label="Name" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted">
                  <SortBtn col="town" label="Town" />
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted">
                  <SortBtn col="attended_price" label="Attended" />
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted">
                  <SortBtn col="cremation_price" label="Cremation" />
                </th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-muted">Verified</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-muted">NAFD</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-muted">SAIF</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-muted">Featured</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-border">
              {pageItems.map(d => (
                <tr
                  key={d.id}
                  className={`hover:bg-cream/40 transition-colors ${d.is_featured ? 'bg-sage-light/20' : ''}`}
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(d.id)}
                      onChange={() => toggleSelect(d.id)}
                      onClick={e => e.stopPropagation()}
                      className="cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-charcoal text-sm leading-snug">{d.name}</p>
                    {d.postcode && <p className="text-xs text-muted">{d.postcode}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">{d.town || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-semibold ${d.attended_price != null ? 'text-charcoal' : 'text-muted'}`}>
                      {fmt(d.attended_price)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-semibold ${d.cremation_price != null ? 'text-charcoal' : 'text-muted'}`}>
                      {fmt(d.cremation_price)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={e => toggleVerified(e, d)}
                      disabled={toggling[`v${d.id}`]}
                      title={d.manually_checked ? 'Unmark as verified' : 'Mark as verified'}
                      className={`text-xs font-bold px-2 py-0.5 rounded-full transition-colors disabled:opacity-50 ${
                        d.manually_checked
                          ? 'bg-sage text-white hover:bg-red-400'
                          : 'bg-cream border border-warm-border text-muted hover:border-sage hover:text-sage'
                      }`}
                    >
                      {toggling[`v${d.id}`] ? '…' : d.manually_checked ? '✓' : '—'}
                    </button>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-sm ${d.nafd_member ? 'text-sage' : 'text-muted opacity-30'}`}>{d.nafd_member ? '✓' : '—'}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-sm ${d.saif_member ? 'text-sage' : 'text-muted opacity-30'}`}>{d.saif_member ? '✓' : '—'}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={e => toggleFeatured(e, d)}
                      disabled={toggling[d.id]}
                      title={d.is_featured ? 'Remove featured' : 'Mark as featured'}
                      className={`text-xs font-bold px-2 py-0.5 rounded-full transition-colors disabled:opacity-50 ${
                        d.is_featured
                          ? 'bg-sage text-white hover:bg-red-400'
                          : 'bg-cream border border-warm-border text-muted hover:border-sage hover:text-sage'
                      }`}
                    >
                      {toggling[d.id] ? '…' : d.is_featured ? '★' : '☆'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setEditing(d)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-warm-border hover:border-sage hover:text-sage transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr><td colSpan={10} className="py-12 text-center text-muted text-sm">No results</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-semibold rounded-xl border border-warm-border hover:border-sage disabled:opacity-40 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-xs text-muted">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-semibold rounded-xl border border-warm-border hover:border-sage disabled:opacity-40 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {editing && (
        <EditModal
          director={editing}
          pw={pw}
          onSave={updated => onUpdate(updated)}
          onDelete={id => { onDelete(id); setEditing(null) }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

// ─── Featured tab ─────────────────────────────────────────────────────────────

function FeaturedTab({ directors, pw, onUpdate }) {
  const featured = directors.filter(d => d.is_featured)
  const [toggling, setToggling] = useState({})

  async function toggleFeatured(d) {
    setToggling(t => ({ ...t, [d.id]: true }))
    const res = await fetch(`/api/admin/update-director?pw=${encodeURIComponent(pw)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: d.id, is_featured: !d.is_featured }),
    })
    if (res.ok) onUpdate({ ...d, is_featured: !d.is_featured })
    setToggling(t => ({ ...t, [d.id]: false }))
  }

  if (!featured.length) {
    return (
      <div className="bg-white rounded-2xl border border-warm-border p-8 text-center shadow-sm">
        <p className="text-charcoal font-semibold mb-2">No featured partners yet</p>
        <p className="text-sm text-muted">Use the Directors tab to mark a director as featured.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {featured.map(d => (
        <div key={d.id} className="bg-white rounded-2xl border border-sage shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-semibold text-charcoal">{d.name}</p>
              <span className="bg-sage text-white text-xs font-bold px-2 py-0.5 rounded-full">Featured</span>
            </div>
            <p className="text-sm text-muted">{d.town} · {d.postcode}</p>
            <div className="flex gap-4 mt-1 text-xs text-muted">
              <span>Attended: <strong className="text-charcoal">{fmt(d.attended_price)}</strong></span>
              <span>Cremation: <strong className="text-charcoal">{fmt(d.cremation_price)}</strong></span>
            </div>
          </div>
          <button
            onClick={() => toggleFeatured(d)}
            disabled={toggling[d.id]}
            className="shrink-0 px-4 py-2 text-sm font-semibold rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-50 transition-colors"
          >
            {toggling[d.id] ? '…' : 'Remove featured'}
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Review tab ───────────────────────────────────────────────────────────────

function ReviewTab({ listings, pw, onRefresh }) {
  const [loading, setLoading] = useState({})
  const needsReview = listings.filter(l => l.needs_review)

  if (!needsReview.length) {
    return (
      <div className="bg-white rounded-2xl border border-warm-border p-8 text-center shadow-sm">
        <p className="text-charcoal font-semibold mb-2">No listings awaiting review</p>
        <p className="text-sm text-muted">New claimed listings will appear here.</p>
      </div>
    )
  }

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
    <div className="space-y-4">
      {needsReview.map(d => (
        <div key={d.id} className="bg-white rounded-2xl border border-amber-200 shadow-sm px-5 py-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="font-semibold text-charcoal">{d.name}</p>
              <p className="text-sm text-muted">{d.town}</p>
              {d.website && <a href={d.website} target="_blank" rel="noopener noreferrer" className="text-sm text-sage hover:underline break-all">{d.website}</a>}
              <p className="text-sm text-muted mt-1">Email: {d.email || '—'}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => act(d.id, true)} disabled={loading[d.id]}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-sage hover:bg-sage-dark text-white disabled:opacity-50">
                {loading[d.id] ? '…' : 'Approve'}
              </button>
              <button onClick={() => act(d.id, false)} disabled={loading[d.id]}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 disabled:opacity-50">
                {loading[d.id] ? '…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Photos tab ───────────────────────────────────────────────────────────────

function PhotosTab({ listings, pw, onRefresh }) {
  const [loading, setLoading] = useState({})
  const withPhotos = listings.filter(l => l.pending_photos?.length)

  if (!withPhotos.length) {
    return (
      <div className="bg-white rounded-2xl border border-warm-border p-8 text-center shadow-sm">
        <p className="text-charcoal font-semibold mb-2">No photos awaiting approval</p>
        <p className="text-sm text-muted">Uploaded photos from directors will appear here.</p>
      </div>
    )
  }

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
    <div className="space-y-6">
      {withPhotos.map(d => (
        <div key={d.id} className="bg-white rounded-2xl border border-warm-border shadow-sm px-5 py-4">
          <p className="font-semibold text-charcoal mb-0.5">{d.name}</p>
          <p className="text-sm text-muted mb-4">{d.town}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {d.pending_photos.map(url => {
              const key  = `${d.id}:${url}`
              const busy = loading[key]
              return (
                <div key={url} className="flex flex-col gap-2">
                  <div className="aspect-video rounded-xl overflow-hidden border border-warm-border">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => act('approve-photo', d.id, url)} disabled={busy}
                      className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-sage hover:bg-sage-dark text-white disabled:opacity-50">
                      {busy ? '…' : 'Approve'}
                    </button>
                    <button onClick={() => act('reject-photo', d.id, url)} disabled={busy}
                      className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 disabled:opacity-50">
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

// ─── Claims tab ───────────────────────────────────────────────────────────────

function ClaimsTab({ directors }) {
  const claimed = [...directors.filter(d => d.claimed_at)]
    .sort((a, b) => new Date(b.claimed_at) - new Date(a.claimed_at))

  if (!claimed.length) {
    return (
      <div className="bg-white rounded-2xl border border-warm-border p-8 text-center shadow-sm">
        <p className="text-charcoal font-semibold mb-2">No claimed listings yet</p>
        <p className="text-sm text-muted">Directors who claim their listing will appear here.</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-muted mb-4">{claimed.length} listing{claimed.length !== 1 ? 's' : ''} claimed</p>
      <div className="bg-white rounded-2xl border border-warm-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-border bg-cream/60">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted">Director</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted">Email</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted">Attended</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted">Cremation</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted">Website</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted">Claimed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-border">
              {claimed.map(d => (
                <tr key={d.id} className="hover:bg-cream/40 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-charcoal leading-snug">{d.name}</p>
                    <p className="text-xs text-muted">{d.town}{d.postcode ? `, ${d.postcode}` : ''}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">{d.email || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-semibold ${d.attended_price != null ? 'text-charcoal' : 'text-muted'}`}>
                      {fmt(d.attended_price)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-semibold ${d.cremation_price != null ? 'text-charcoal' : 'text-muted'}`}>
                      {fmt(d.cremation_price)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">{d.phone || '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    {d.website
                      ? <a href={d.website} target="_blank" rel="noopener noreferrer" className="text-sage hover:underline truncate block max-w-[160px]">{d.website.replace(/^https?:\/\//, '')}</a>
                      : <span className="text-muted">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                    {new Date(d.claimed_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Campaign tab ────────────────────────────────────────────────────────────

function fmtCampaignDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function CampaignTab({ directors }) {
  const [filter, setFilter] = useState('all')
  const [page,   setPage]   = useState(0)
  const PER_PAGE = 50

  const withEmail  = directors.filter(d => d.email)
  const emailed    = directors.filter(d => d.claim_email_sent_at)
  const claimedAll = directors.filter(d => d.claimed_at)
  const featured   = directors.filter(d => d.is_featured)
  const notEmailed = withEmail.filter(d => !d.claim_email_sent_at)

  const now      = Date.now()
  const thisWeek  = emailed.filter(d => now - new Date(d.claim_email_sent_at) < 7  * 86400000).length
  const thisMonth = emailed.filter(d => now - new Date(d.claim_email_sent_at) < 30 * 86400000).length

  const sorted   = [...emailed].sort((a, b) => new Date(b.claim_email_sent_at) - new Date(a.claim_email_sent_at))
  const filtered = filter === 'claimed'   ? sorted.filter(d => d.claimed_at)
                 : filter === 'unclaimed' ? sorted.filter(d => !d.claimed_at)
                 : sorted
  const pages = Math.ceil(filtered.length / PER_PAGE)
  const shown = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

  return (
    <div className="space-y-6">

      {/* Funnel */}
      <div>
        <h3 className="text-sm font-bold text-charcoal mb-3">Outreach funnel</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Have email on file"   value={withEmail.length.toLocaleString()}  sub={pct(withEmail.length, directors.length) + ' of total'} />
          <StatCard label="Claim email sent"      value={emailed.length.toLocaleString()}    sub={pct(emailed.length, withEmail.length) + ' of emailable'} />
          <StatCard label="Listing claimed"       value={claimedAll.length.toLocaleString()} sub={emailed.length ? pct(claimedAll.length, emailed.length) + ' of emailed' : '—'} accent />
          <StatCard label="Upgraded to Featured"  value={featured.length.toLocaleString()}   sub={claimedAll.length ? pct(featured.length, claimedAll.length) + ' of claimed' : '—'} />
        </div>
      </div>

      {/* Email activity */}
      <div>
        <h3 className="text-sm font-bold text-charcoal mb-3">Email activity</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Sent this week"    value={thisWeek.toLocaleString()} />
          <StatCard label="Sent last 30 days" value={thisMonth.toLocaleString()} />
          <StatCard label="Not yet emailed"   value={notEmailed.length.toLocaleString()} sub="have email on file" />
          <StatCard label="No email on file"  value={(directors.length - withEmail.length).toLocaleString()} sub="unreachable" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-warm-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-warm-border flex items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-charcoal shrink-0">
            Emailed directors <span className="font-normal text-muted">({emailed.length.toLocaleString()})</span>
          </h3>
          <div className="flex gap-1">
            {[['all', 'All'], ['claimed', 'Claimed'], ['unclaimed', 'Not claimed']].map(([id, label]) => (
              <button key={id} onClick={() => { setFilter(id); setPage(0) }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${filter === id ? 'bg-sage text-white' : 'text-muted hover:text-charcoal'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-border bg-cream/60 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Director</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Emailed</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Claimed</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">Featured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-border">
              {shown.map(d => (
                <tr key={d.id} className="hover:bg-cream/40 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-charcoal leading-snug">{d.name}</p>
                    <p className="text-xs text-muted">{d.town}{d.postcode ? `, ${d.postcode}` : ''}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">{fmtCampaignDate(d.claim_email_sent_at)}</td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap">
                    {d.claimed_at
                      ? <span className="font-semibold text-sage">{fmtCampaignDate(d.claimed_at)}</span>
                      : <span className="text-muted">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {d.is_featured
                      ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sage text-white">Featured</span>
                      : <span className="text-xs text-muted">—</span>}
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted">No directors match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="px-5 py-3 border-t border-warm-border flex items-center justify-between text-sm text-muted">
            <span className="text-xs">{filtered.length.toLocaleString()} total</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="px-3 py-1 rounded-lg border border-warm-border text-xs font-semibold disabled:opacity-40 hover:border-sage transition-colors">← Prev</button>
              <span className="text-xs">{page + 1} / {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page === pages - 1}
                className="px-3 py-1 rounded-lg border border-warm-border text-xs font-semibold disabled:opacity-40 hover:border-sage transition-colors">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Applications tab ────────────────────────────────────────────────────────

function ApplicationsTab({ applications, pw, onRefresh }) {
  const [loading,  setLoading]  = useState({})
  const [feedback, setFeedback] = useState({})

  async function approve(a) {
    setLoading(s => ({ ...s, [a.id]: 'approving' }))
    setFeedback(s => ({ ...s, [a.id]: null }))
    try {
      const res  = await fetch('/api/admin/approve-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pw, id: a.id, website: a.website, business_name: a.business_name, postcode: a.postcode, email: a.email }),
      })
      const data = await res.json()
      if (data.ok) {
        setFeedback(s => ({ ...s, [a.id]: { type: 'success', msg: `Approved — dashboard link sent to ${a.email}` } }))
        setTimeout(onRefresh, 1500)
      } else if (data.reason === 'no_match') {
        setFeedback(s => ({ ...s, [a.id]: { type: 'warn', msg: 'No matching listing found in the database. Search for them in the Directors tab and match manually, then deny this application.' } }))
      } else if (data.reason === 'no_email') {
        setFeedback(s => ({ ...s, [a.id]: { type: 'warn', msg: 'Listing found but has no email address. Add their email in the Directors tab first, then approve again.' } }))
      } else {
        setFeedback(s => ({ ...s, [a.id]: { type: 'error', msg: 'Something went wrong. Try again.' } }))
      }
    } catch {
      setFeedback(s => ({ ...s, [a.id]: { type: 'error', msg: 'Request failed. Try again.' } }))
    }
    setLoading(s => ({ ...s, [a.id]: null }))
  }

  async function deny(id) {
    setLoading(s => ({ ...s, [id]: 'denying' }))
    await fetch('/api/admin/dismiss-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pw, id }),
    })
    setLoading(s => ({ ...s, [id]: null }))
    onRefresh()
  }

  if (!applications?.length) {
    return (
      <div className="bg-white rounded-2xl border border-warm-border p-8 text-center shadow-sm">
        <p className="text-charcoal font-semibold mb-2">No new applications</p>
        <p className="text-sm text-muted">Submissions from the For Funeral Directors page will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {applications.map(a => (
        <div key={a.id} className="bg-white rounded-2xl border border-warm-border shadow-sm p-5">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <p className="font-semibold text-charcoal text-base">{a.business_name || '—'}</p>
              <p className="text-sm text-muted mt-0.5">
                {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => approve(a)}
                disabled={!!loading[a.id]}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-sage hover:bg-sage-dark text-white disabled:opacity-50 transition-colors"
              >
                {loading[a.id] === 'approving' ? '…' : 'Approve'}
              </button>
              <button
                onClick={() => deny(a.id)}
                disabled={!!loading[a.id]}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 disabled:opacity-50 transition-colors"
              >
                {loading[a.id] === 'denying' ? '…' : 'Deny'}
              </button>
            </div>
          </div>

          {/* Feedback */}
          {feedback[a.id] && (
            <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${
              feedback[a.id].type === 'success' ? 'bg-sage-light border border-sage-border text-sage' :
              feedback[a.id].type === 'warn'    ? 'bg-amber-50 border border-amber-200 text-amber-800' :
                                                   'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {feedback[a.id].msg}
            </div>
          )}

          {/* Details */}
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
            {a.contact_name    && <Row label="Contact"    value={a.contact_name} />}
            {a.email           && <Row label="Email"      value={<a href={`mailto:${a.email}`} className="text-sage hover:underline">{a.email}</a>} />}
            {a.phone           && <Row label="Phone"      value={<a href={`tel:${a.phone}`} className="text-sage hover:underline">{a.phone}</a>} />}
            {a.postcode        && <Row label="Postcode"   value={a.postcode} />}
            {a.website         && <Row label="Website"    value={<a href={a.website} target="_blank" rel="noopener noreferrer" className="text-sage hover:underline break-all">{a.website}</a>} />}
            {a.attended_price  && <Row label="Attended"   value={`£${Number(a.attended_price).toLocaleString('en-GB')}`} />}
            {a.cremation_price && <Row label="Cremation"  value={`£${Number(a.cremation_price).toLocaleString('en-GB')}`} />}
          </div>

          {a.packages && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-1">Packages</p>
              <p className="text-sm text-charcoal whitespace-pre-wrap leading-relaxed">{a.packages}</p>
            </div>
          )}

          {a.message && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-1">Message</p>
              <p className="text-sm text-charcoal whitespace-pre-wrap leading-relaxed">{a.message}</p>
            </div>
          )}

          {a.photo_url && (
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">Photo</p>
              <img src={a.photo_url} alt="Submitted photo" className="w-40 h-28 object-cover rounded-xl border border-warm-border" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted shrink-0 w-28">{label}</span>
      <span className="text-charcoal font-medium">{value}</span>
    </div>
  )
}

// ─── Reviews tab ─────────────────────────────────────────────────────────────

function ReviewsTab({ pw }) {
  const [reviews,  setReviews]  = useState(null)
  const [loading,  setLoading]  = useState({})

  function loadReviews() {
    return fetch(`/api/admin/reviews?pw=${encodeURIComponent(pw)}`)
      .then(r => r.ok ? r.json() : [])
      .then(setReviews)
  }

  useEffect(() => { loadReviews() }, [pw])

  async function act(reviewId, approve) {
    setLoading(l => ({ ...l, [reviewId]: true }))
    await fetch('/api/admin/moderate-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pw, reviewId, approve }),
    })
    setLoading(l => ({ ...l, [reviewId]: false }))
    await loadReviews()
  }

  const STAR_PATH = 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z'

  if (!reviews) return <Spinner />

  if (!reviews.length) {
    return (
      <div className="bg-white rounded-2xl border border-warm-border p-8 text-center shadow-sm">
        <p className="text-charcoal font-semibold mb-2">No reviews awaiting moderation</p>
        <p className="text-sm text-muted">Submitted reviews will appear here for approval.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map(r => (
        <div key={r.id} className="bg-white rounded-2xl border border-warm-border shadow-sm px-5 py-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-charcoal">{r.funeral_directors?.name || '—'}</p>
              <p className="text-xs text-muted mb-2">{r.funeral_directors?.town}</p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1.5">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className={`w-3.5 h-3.5 ${i <= r.rating ? 'text-amber-400' : 'text-warm-border'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path d={STAR_PATH} />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-semibold text-charcoal">{r.reviewer_name}</span>
                <span className="text-xs text-muted">
                  · {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <p className="text-sm text-charcoal leading-relaxed">{r.body}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => act(r.id, true)} disabled={loading[r.id]}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-sage hover:bg-sage-dark text-white disabled:opacity-50">
                {loading[r.id] ? '…' : 'Approve'}
              </button>
              <button onClick={() => act(r.id, false)} disabled={loading[r.id]}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 disabled:opacity-50">
                {loading[r.id] ? '…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview',      label: 'Overview' },
  { id: 'applications',  label: 'Applications' },
  { id: 'campaign',      label: 'Campaign' },
  { id: 'claims',        label: 'Claims' },
  { id: 'directors',     label: 'Directors' },
  { id: 'featured',      label: 'Featured' },
  { id: 'review',        label: 'Verification' },
  { id: 'photos',        label: 'Photos' },
  { id: 'reviews',       label: 'Reviews' },
]

export default function AdminPanel() {
  const [pw,           setPw]           = useState('')
  const [input,        setInput]        = useState('')
  const [directors,    setDirectors]    = useState(null)
  const [listings,     setListings]     = useState(null)
  const [applications, setApplications] = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)
  const [tab,          setTab]          = useState('overview')
  const [claimsSeen,   setClaimsSeen]   = useState(false)

  async function login(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    // Verify password using the known-stable listings endpoint
    const lRes = await fetch(`/api/admin/listings?pw=${encodeURIComponent(input)}`)
    if (!lRes.ok) { setError('Incorrect password'); setLoading(false); return }
    const l = await lRes.json()
    const [dRes, aRes] = await Promise.all([
      fetch(`/api/admin/all-directors?pw=${encodeURIComponent(input)}`),
      fetch(`/api/admin/applications?pw=${encodeURIComponent(input)}`),
    ])
    const d = dRes.ok ? await dRes.json() : []
    const a = aRes.ok ? await aRes.json() : []
    setPw(input)
    setListings(l)
    setDirectors(d)
    setApplications(a)
    setLoading(false)
  }

  async function refresh() {
    const [dRes, lRes, aRes] = await Promise.all([
      fetch(`/api/admin/all-directors?pw=${encodeURIComponent(pw)}`),
      fetch(`/api/admin/listings?pw=${encodeURIComponent(pw)}`),
      fetch(`/api/admin/applications?pw=${encodeURIComponent(pw)}`),
    ])
    if (dRes.ok) setDirectors(await dRes.json())
    else setDirectors([])
    if (lRes.ok) setListings(await lRes.json())
    if (aRes.ok) setApplications(await aRes.json())
  }

  function handleUpdate(updated) {
    setDirectors(prev => prev.map(d => d.id === updated.id ? { ...d, ...updated } : d))
  }

  function handleDelete(id) {
    setDirectors(prev => prev.filter(d => d.id !== id))
  }

  const reviewCount      = listings?.filter(l => l.needs_review).length ?? 0
  const photoCount       = listings?.filter(l => l.pending_photos?.length).length ?? 0
  const claimCount       = directors?.filter(d => d.claimed_at).length ?? 0
  const applicationCount = applications?.length ?? 0

  return (
    <div className="min-h-screen bg-cream">

      {!pw ? (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center gap-0.5 mb-2">
                <span className="text-2xl font-bold text-charcoal">Funeral</span>
                <span className="text-2xl font-bold text-sage">Fair</span>
              </div>
              <p className="text-muted text-sm">Superadmin dashboard</p>
            </div>
            <form onSubmit={login} className="flex flex-col gap-3">
              <input
                type="password"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Admin password"
                className="px-4 py-3.5 rounded-xl border border-warm-border bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-sage text-sm"
                required
              />
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="py-3.5 bg-sage hover:bg-sage-dark text-white font-semibold rounded-xl text-sm disabled:opacity-60 transition-colors"
              >
                {loading ? 'Loading…' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div>
          {/* Top bar */}
          <div className="bg-charcoal text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
              <div className="flex items-baseline gap-0.5">
                <span className="text-base font-bold">Funeral</span>
                <span className="text-base font-bold text-sage">Fair</span>
                <span className="text-xs text-white/40 ml-2">admin</span>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={refresh} className="text-xs text-white/60 hover:text-white transition-colors">
                  Refresh
                </button>
                <button onClick={() => { setPw(''); setDirectors(null); setListings(null) }} className="text-xs text-white/60 hover:text-white transition-colors">
                  Sign out
                </button>
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="bg-white border-b border-warm-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex gap-0 overflow-x-auto">
                {TABS.map(t => {
                  const badge = t.id === 'review' ? reviewCount : t.id === 'photos' ? photoCount : t.id === 'claims' ? (claimsSeen ? 0 : claimCount) : t.id === 'applications' ? applicationCount : 0
                  return (
                    <button
                      key={t.id}
                      onClick={() => { setTab(t.id); if (t.id === 'claims') setClaimsSeen(true) }}
                      className={`relative px-4 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                        tab === t.id
                          ? 'border-sage text-sage'
                          : 'border-transparent text-muted hover:text-charcoal'
                      }`}
                    >
                      {t.label}
                      {badge > 0 && (
                        <span className="ml-1.5 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                          {badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {!directors ? (
              <Spinner />
            ) : (
              <>
                {tab === 'overview'      && <OverviewTab directors={directors} />}
                {tab === 'applications' && <ApplicationsTab applications={applications} pw={pw} onRefresh={refresh} />}
                {tab === 'campaign'     && <CampaignTab directors={directors} />}
                {tab === 'claims'       && <ClaimsTab directors={directors} />}
                {tab === 'directors' && <DirectorsTab directors={directors} pw={pw} onUpdate={handleUpdate} onDelete={handleDelete} />}
                {tab === 'featured'  && <FeaturedTab  directors={directors} pw={pw} onUpdate={handleUpdate} />}
                {tab === 'review'    && listings && <ReviewTab listings={listings} pw={pw} onRefresh={refresh} />}
                {tab === 'photos'    && listings && <PhotosTab listings={listings} pw={pw} onRefresh={refresh} />}
                {tab === 'reviews'   && <ReviewsTab pw={pw} />}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
