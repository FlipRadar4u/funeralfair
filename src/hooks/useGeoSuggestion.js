import { useState, useEffect } from 'react'

export function useGeoSuggestion() {
  const [suggestion, setSuggestion] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const geoRes = await fetch('/api/geo')
        if (!geoRes.ok || cancelled) return
        const geo = await geoRes.json()
        if (!geo.lat || !geo.lng || !geo.city || cancelled) return

        const dirRes = await fetch(`/api/directors?lat=${geo.lat}&lng=${geo.lng}&radius=15`)
        if (!dirRes.ok || cancelled) return
        const dirs = await dirRes.json()
        if (cancelled || !dirs.length) return

        const ap = dirs.map(d => d.attended_price).filter(p => p != null && p > 0)
        const cp = dirs.map(d => d.cremation_price).filter(p => p != null && p > 0)
        const avg = arr => arr.length >= 3
          ? Math.round(arr.reduce((s, p) => s + p, 0) / arr.length)
          : null

        setSuggestion({
          city:         geo.city,
          avgAttended:  avg(ap),
          avgCremation: avg(cp),
          count:        dirs.length,
        })
      } catch {}
    }
    load()
    return () => { cancelled = true }
  }, [])

  return suggestion
}
