import { createPortal } from 'react-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCompare } from '../context/CompareContext'

export default function CompareBar() {
  const { list, remove, clear } = useCompare()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  if (list.length === 0) return null
  if (pathname === '/compare') return null
  if (pathname.startsWith('/director/') && pathname !== '/director/dashboard') return null

  return createPortal(
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-charcoal shadow-2xl"
      style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-4">

        {/* Director name pills */}
        <div className="flex gap-2 flex-1 min-w-0 overflow-x-auto">
          {list.map(d => (
            <div
              key={d.id}
              className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-2 shrink-0"
            >
              <span className="text-white text-xs font-semibold max-w-[90px] sm:max-w-[150px] truncate">
                {d.name}
              </span>
              <button
                onClick={() => remove(d.id)}
                className="text-white/50 hover:text-white text-base leading-none ml-0.5 w-4 h-4 flex items-center justify-center"
                aria-label={`Remove ${d.name}`}
              >
                ×
              </button>
            </div>
          ))}
          {list.length < 3 && (
            <div className="hidden sm:flex items-center border border-dashed border-white/20 rounded-lg px-3 py-1.5 shrink-0">
              <span className="text-white/30 text-xs">+ {3 - list.length} more</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clear}
            className="text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => navigate('/compare')}
            className="px-4 py-2.5 bg-sage hover:bg-sage-dark active:bg-sage-dark text-white text-sm font-semibold rounded-xl whitespace-nowrap transition-colors"
            style={{ touchAction: 'manipulation' }}
          >
            Compare {list.length} →
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
