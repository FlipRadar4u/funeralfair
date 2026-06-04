import { Link } from 'react-router-dom'
import { resetCookieConsent } from './CookieBanner'

export default function Footer() {
  return (
    <footer className="border-t border-warm-border bg-cream mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 mb-8">
          <Link to="/" className="flex items-center gap-1 select-none">
            <img src="/logo.png" alt="" className="h-9 w-auto" />
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
          <p className="text-sm text-muted italic">Honest pricing when it matters most</p>
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
