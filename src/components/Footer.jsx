import { Link } from 'react-router-dom'
import { resetCookieConsent } from './CookieBanner'

export default function Footer() {
  return (
    <footer className="border-t border-warm-border bg-cream mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 mb-8">
          <Link to="/" className="flex items-center gap-1 select-none">
            <img src="/logo.webp" alt="" className="h-9 w-auto" width="100" height="140" />
            <span className="flex items-baseline gap-0.5">
              <span className="text-lg font-bold text-charcoal">Funeral</span>
              <span className="text-lg font-bold text-sage">Fair</span>
            </span>
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-0.5">
            {[
              { to: '/search',                        label: 'Compare Prices' },
              { to: '/what-to-do-when-someone-dies',  label: 'When Someone Dies' },
              { to: '/funeral-costs/uk',              label: 'Cost Guide' },
              { to: '/government-grants',             label: 'Government Grants' },
              { to: '/blog',                          label: 'Guides' },
              { to: '/about',                         label: 'About' },
              { to: '/for-funeral-directors',         label: 'For Directors' },
              { to: '/how-we-rank',                   label: 'How We Rank' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="py-2.5 text-sm text-muted hover:text-charcoal transition-colors"
                style={{ touchAction: 'manipulation' }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-warm-border pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted italic">Honest pricing when it matters most</p>
            <div className="flex items-center gap-3">
              <a href="https://x.com/FuneralFairUK" target="_blank" rel="noopener noreferrer" aria-label="FuneralFair on X" className="text-muted hover:text-charcoal transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L2.25 2.25h6.918l4.254 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
                </svg>
              </a>
              <a href="https://instagram.com/funeralfair" target="_blank" rel="noopener noreferrer" aria-label="FuneralFair on Instagram" className="text-muted hover:text-charcoal transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted">
            <Link to="/privacy" className="hover:text-charcoal transition-colors">Privacy Policy</Link>
            <button onClick={resetCookieConsent} className="hover:text-charcoal transition-colors">Cookie settings</button>
            <a href="mailto:hello@funeralfair.co.uk" className="hover:text-charcoal transition-colors">hello@funeralfair.co.uk</a>
            <span>© {new Date().getFullYear()} FuneralFair</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
