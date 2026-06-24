import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function DirectorLogin() {
  const [email,     setEmail]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent,      setSent]      = useState(false)
  const [error,     setError]     = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/director/send-dashboard-link', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: trimmed }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error || 'Something went wrong — please try again.')
        return
      }
      setSent(true)
    } catch {
      setError('Something went wrong — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-sm">

          {!sent ? (
            <>
              <div className="mb-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-sage-light border border-sage-border flex items-center justify-center mx-auto mb-5">
                  <svg className="w-7 h-7 text-sage" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-charcoal mb-2">Access your dashboard</h1>
                <p className="text-sm text-muted leading-relaxed">
                  Enter the email address on your FuneralFair listing and we'll send you a link to your dashboard. No password needed.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-charcoal uppercase tracking-wide">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="hello@yourfuneralhome.co.uk"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-warm-border bg-white text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-sage hover:bg-sage-dark disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
                >
                  {submitting ? 'Sending…' : 'Send me my dashboard link'}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-muted leading-relaxed">
                Don't have a listing yet?{' '}
                <Link to="/for-funeral-directors" className="text-sage underline underline-offset-2 hover:text-sage-dark">
                  Get your free listing →
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-sage-light border border-sage-border flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-sage" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.981l7.5-4.039a2.25 2.25 0 0 1 2.134 0l7.5 4.039a2.25 2.25 0 0 1 1.183 1.98V19.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-charcoal mb-2">Check your inbox</h1>
              <p className="text-sm text-muted leading-relaxed mb-6">
                If <strong className="text-charcoal">{email}</strong> is registered to a listing, we've sent your dashboard link. It may take a minute to arrive.
              </p>
              <p className="text-xs text-muted">
                Wrong email?{' '}
                <button
                  onClick={() => { setSent(false); setEmail('') }}
                  className="text-sage underline underline-offset-2 hover:text-sage-dark"
                >
                  Try again
                </button>
              </p>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}
