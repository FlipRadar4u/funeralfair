const PIN = (
  <svg className="w-3.5 h-3.5 text-sage shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />
  </svg>
)

export default function GeoSuggestion({ suggestion, onSelect }) {
  if (!suggestion) return null

  const fmt = n => `£${n.toLocaleString('en-GB')}`

  return (
    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-warm-border shadow-lg px-4 py-3 z-20">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-sage mb-1">
            {PIN}
            Near you · {suggestion.city}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted">
            {suggestion.avgAttended  && <span>Avg. attended: <strong className="text-charcoal">{fmt(suggestion.avgAttended)}</strong></span>}
            {suggestion.avgCremation && <span>Avg. cremation: <strong className="text-charcoal">{fmt(suggestion.avgCremation)}</strong></span>}
            {!suggestion.avgAttended && !suggestion.avgCremation && suggestion.count > 0 && (
              <span>{suggestion.count} directors nearby</span>
            )}
          </div>
        </div>
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); onSelect(suggestion.city) }}
          onTouchStart={e => { e.preventDefault(); onSelect(suggestion.city) }}
          className="shrink-0 px-3 py-1.5 bg-sage hover:bg-sage-dark text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Search →
        </button>
      </div>
    </div>
  )
}
