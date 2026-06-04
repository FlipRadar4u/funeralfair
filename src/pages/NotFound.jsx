import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function NotFound() {
  useEffect(() => {
    document.title = 'Page not found — FuneralFair'
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-5 py-24">
        <div className="text-center max-w-md">
          <p className="text-6xl font-bold text-sage mb-4">404</p>
          <h1 className="text-2xl font-bold text-charcoal mb-3">Page not found</h1>
          <p className="text-muted text-sm leading-relaxed mb-8">
            This page doesn't exist. It may have been moved, or the link may be incorrect.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="px-6 py-3 bg-sage hover:bg-sage-dark text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Go to homepage
            </Link>
            <Link
              to="/search"
              className="px-6 py-3 border border-warm-border bg-white hover:border-sage text-charcoal font-semibold rounded-xl text-sm transition-colors"
            >
              Find funeral directors
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
