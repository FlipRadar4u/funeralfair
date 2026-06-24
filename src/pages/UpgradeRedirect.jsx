import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

export default function UpgradeRedirect() {
  const { token } = useParams()
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) { setError('Invalid link.'); return }

    async function redirect() {
      // 1. Load director via claim token
      const dirRes = await fetch(`/api/claim/${token}`)
      if (!dirRes.ok) { setError('This link has expired or is invalid.'); return }
      const director = await dirRes.json()

      // Already featured — send to dashboard
      if (director.is_featured) {
        window.location.href = `/dashboard/${token}`
        return
      }

      if (!director.email || !director.website) {
        setError('Please add your email and website in your dashboard before upgrading.')
        return
      }

      // 2. Create Stripe checkout session
      const checkoutRes = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: director.name, email: director.email, website: director.website }),
      })
      const data = await checkoutRes.json()
      if (!checkoutRes.ok || !data.url) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

      // 3. Redirect to Stripe
      window.location.href = data.url
    }

    redirect().catch(() => setError('Something went wrong. Please try again.'))
  }, [token])

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="flex items-baseline justify-center gap-0.5 mb-8">
            <span className="text-2xl font-bold text-charcoal">Funeral</span>
            <span className="text-2xl font-bold text-sage">Fair</span>
          </div>
          <p className="text-charcoal font-semibold mb-2">Couldn't start checkout</p>
          <p className="text-sm text-muted mb-6 leading-relaxed">{error}</p>
          <div className="flex flex-col gap-3">
            {token && (
              <Link to={`/dashboard/${token}`}
                className="py-3 bg-sage hover:bg-sage-dark text-white font-semibold rounded-xl text-sm transition-colors block text-center">
                Go to my dashboard →
              </Link>
            )}
            <Link to="/for-funeral-directors"
              className="py-3 border border-warm-border bg-white hover:border-sage text-charcoal font-semibold rounded-xl text-sm transition-colors block text-center">
              Learn about Featured
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex items-baseline justify-center gap-0.5 mb-8">
          <span className="text-2xl font-bold text-charcoal">Funeral</span>
          <span className="text-2xl font-bold text-sage">Fair</span>
        </div>
        <div className="w-8 h-8 rounded-full border-2 border-sage animate-spin mx-auto mb-4" style={{ borderTopColor: 'transparent' }} />
        <p className="text-sm text-muted">Taking you to checkout…</p>
      </div>
    </div>
  )
}
