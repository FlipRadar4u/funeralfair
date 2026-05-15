import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function FeaturedConfirmed() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-5 py-20">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-sage-light border border-sage-border flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-sage" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-charcoal mb-3">You're featured!</h1>
          <p className="text-muted leading-relaxed mb-2">
            Your payment was successful. Your listing will appear in the <strong className="text-charcoal">Featured Partner</strong> section at the top of local search results within a few minutes.
          </p>
          <p className="text-sm text-muted leading-relaxed mb-8">
            You'll receive a receipt by email. You can manage your subscription, update your card, or cancel at any time through Stripe's billing portal.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/search"
              className="px-6 py-3 bg-sage hover:bg-sage-dark text-white font-semibold rounded-xl text-sm transition-colors"
            >
              View search results
            </Link>
            <Link
              to="/"
              className="px-6 py-3 border border-warm-border hover:border-sage text-charcoal font-semibold rounded-xl text-sm transition-colors"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
