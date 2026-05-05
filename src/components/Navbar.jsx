import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const navLinks = [
    { label: 'Compare Prices',    path: '/search' },
    { label: 'Cost Guide',        path: '/cost-guide' },
    { label: 'Government Grants', path: '/government-grants' },
    { label: 'For Directors',     path: '/for-funeral-directors' },
  ]

  function go(path) {
    navigate(path)
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-warm-border shadow-sm">
      <div className="max-w-5xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">

        <Link to="/" className="flex items-baseline gap-0.5 select-none" onClick={() => setMenuOpen(false)}>
          <span className="text-xl font-bold tracking-tight text-charcoal">Funeral</span>
          <span className="text-xl font-bold tracking-tight text-sage">Fair</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-8">
          {navLinks.map(({ label, path }) => (
            <button
              key={path}
              onClick={() => go(path)}
              className="text-sm font-medium text-muted hover:text-charcoal hover:underline underline-offset-4 decoration-sage"
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Burger button */}
        <button
          className="sm:hidden flex items-center justify-center w-10 h-10 -mr-2 rounded-lg text-muted hover:text-charcoal active:bg-sage-light"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          style={{ touchAction: 'manipulation' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              style={{ transition: 'd 200ms ease' }}
            />
          </svg>
        </button>
      </div>

      {/* Mobile menu — always rendered so CSS can animate it */}
      <div
        className="sm:hidden overflow-hidden border-t border-warm-border"
        style={{
          maxHeight: menuOpen ? '320px' : '0px',
          opacity: menuOpen ? 1 : 0,
          transition: 'max-height 300ms ease, opacity 200ms ease',
        }}
      >
        <nav className="px-5 py-2 flex flex-col bg-cream">
          {navLinks.map(({ label, path }, i) => (
            <button
              key={path}
              onClick={() => go(path)}
              className={`text-base font-medium text-charcoal text-left py-4 w-full active:text-sage ${i < navLinks.length - 1 ? 'border-b border-warm-border' : ''}`}
              style={{ touchAction: 'manipulation' }}
            >
              {label}
            </button>
          ))}
          <div className="py-3">
            <button
              onClick={() => go('/search')}
              className="w-full py-3 bg-sage text-white font-semibold rounded-xl text-sm active:bg-sage-dark"
              style={{ touchAction: 'manipulation' }}
            >
              Find funeral directors →
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}
