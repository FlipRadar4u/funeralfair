import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const navLinks = [
    { label: 'Compare Prices',    path: '/search' },
    { label: 'When Someone Dies', path: '/what-to-do-when-someone-dies' },
    { label: 'Cost Guide',        path: '/funeral-costs/uk' },
    { label: 'Blog',               path: '/blog' },
    { label: 'About',             path: '/about' },
  ]

  function go(path) {
    navigate(path)
    setMenuOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-warm-border shadow-sm">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">

          <Link to="/" className="flex items-center gap-1 select-none" onClick={() => setMenuOpen(false)}>
            <img src="/logo.webp" alt="" className="h-10 w-auto" width="100" height="140" />
            <span className="flex items-baseline gap-0.5">
              <span className="text-xl font-bold tracking-tight text-charcoal">Funeral</span>
              <span className="text-xl font-bold tracking-tight text-sage">Fair</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map(({ label, path }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? 'text-charcoal underline underline-offset-4 decoration-sage' : 'text-muted hover:text-charcoal hover:underline underline-offset-4 decoration-sage'}`
                }
              >
                {label}
              </NavLink>
            ))}
            <NavLink
              to="/for-funeral-directors"
              className={({ isActive }) =>
                `text-sm font-medium px-3.5 py-1.5 rounded-lg border transition-colors ${isActive ? 'border-sage text-sage bg-sage-light' : 'border-warm-border text-muted hover:border-sage hover:text-sage'}`
              }
            >
              For Directors
            </NavLink>
          </nav>

          {/* Burger */}
          <button
            className="lg:hidden relative flex items-center justify-center w-10 h-10 -mr-2 rounded-lg text-charcoal active:bg-sage-light transition-colors"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            style={{ touchAction: 'manipulation' }}
          >
            <span className="absolute w-5 transition-all duration-150"
              style={{ opacity: menuOpen ? 0 : 1, transform: menuOpen ? 'rotate(45deg) scale(0.6)' : 'none' }}>
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </span>
            <span className="absolute w-5 transition-all duration-150"
              style={{ opacity: menuOpen ? 1 : 0, transform: menuOpen ? 'none' : 'rotate(-45deg) scale(0.6)' }}>
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          </button>
        </div>
      </header>

      {/* Mobile menu — portalled to body so page-enter animation doesn't trap fixed positioning */}
      {createPortal(<div
        className="lg:hidden fixed left-0 right-0 z-[49] bg-cream border-b border-warm-border shadow-lg"
        style={{
          top: '64px',
          opacity: menuOpen ? 1 : 0,
          transform: menuOpen ? 'translateY(0)' : 'translateY(-6px)',
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 180ms cubic-bezier(0.4,0,0.2,1), transform 180ms cubic-bezier(0.4,0,0.2,1)',
          willChange: 'transform, opacity',
        }}
      >
        <nav className="px-5 pt-2 pb-4 flex flex-col">
          {navLinks.map(({ label, path }, i) => (
            <button
              key={path}
              onClick={() => go(path)}
              className={`text-base font-medium text-charcoal text-left py-4 w-full active:text-sage transition-colors duration-100 ${
                i < navLinks.length - 1 ? 'border-b border-warm-border' : ''
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => go('/for-funeral-directors')}
            className="text-base font-medium text-sage text-left py-4 w-full border-t border-warm-border active:opacity-70 transition-colors duration-100"
            style={{ touchAction: 'manipulation' }}
          >
            For Directors →
          </button>
          <div className="pt-3 pb-1">
            <button
              onClick={() => go('/search')}
              className="w-full py-3.5 bg-sage active:bg-sage-dark text-white font-semibold rounded-xl text-sm transition-colors duration-100"
              style={{ touchAction: 'manipulation' }}
            >
              Find funeral directors →
            </button>
          </div>
        </nav>
      </div>, document.body)}

      {/* Backdrop */}
      {createPortal(<div
        className="lg:hidden fixed inset-0 z-40"
        style={{
          background: 'rgba(0,0,0,0.18)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 180ms cubic-bezier(0.4,0,0.2,1)',
          willChange: 'opacity',
        }}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />, document.body)}
    </>
  )
}
