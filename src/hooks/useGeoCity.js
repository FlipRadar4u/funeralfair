import { useState, useEffect } from 'react'

export function useGeoCity() {
  const [city, setCity] = useState(null)
  useEffect(() => {
    let cancelled = false
    fetch('/api/geo')
      .then(r => r.ok ? r.json() : null)
      .then(geo => { if (!cancelled && geo?.city) setCity(geo.city) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])
  return city
}
