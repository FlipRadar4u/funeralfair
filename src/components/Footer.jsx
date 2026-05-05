import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-warm-border bg-cream mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 mb-5">
          <Link to="/" className="flex items-baseline gap-0.5 select-none">
            <span className="text-lg font-bold text-charcoal">Funeral</span>
            <span className="text-lg font-bold text-sage">Fair</span>
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-6">
            <Link to="/search" className="text-sm text-muted hover:text-charcoal transition-colors">Compare Prices</Link>
            <Link to="/cost-guide" className="text-sm text-muted hover:text-charcoal transition-colors">Cost Guide</Link>
            <Link to="/government-grants" className="text-sm text-muted hover:text-charcoal transition-colors">Government Grants</Link>
            <Link to="/for-funeral-directors" className="text-sm text-muted hover:text-charcoal transition-colors">For Funeral Directors</Link>
          </nav>
        </div>
        <div className="border-t border-warm-border pt-5 text-center">
          <p className="text-sm text-muted italic">Honest pricing when it matters most</p>
        </div>
      </div>
    </footer>
  )
}
