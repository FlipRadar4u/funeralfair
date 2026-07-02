import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { createPortal } from 'react-dom'

const GA_ID = 'G-HTL2ESS3E8'
const STORAGE_KEY = 'ff_cookie_consent'
const RESET_EVENT = 'ff:reset-cookie-consent'

function loadGA() {
  if (document.getElementById('ff-ga-script')) return
  const s = document.createElement('script')
  s.id = 'ff-ga-script'
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)
  window.dataLayer = window.dataLayer || []
  function gtag() { window.dataLayer.push(arguments) }
  window.gtag = gtag
  gtag('js', new Date())
  gtag('config', GA_ID)
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'accepted') { loadGA(); return }
    if (stored === 'declined') return
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    function show() { setVisible(true) }
    window.addEventListener(RESET_EVENT, show)
    return () => window.removeEventListener(RESET_EVENT, show)
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setVisible(false)
    loadGA()
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return createPortal(
    <div
      style={{
        position: 'fixed', bottom: '16px', left: '16px', right: '16px',
        zIndex: 9998, display: 'flex', justifyContent: 'center',
        animation: 'cookieSlideUp 250ms ease forwards',
      }}
    >
      <style>{`
        @keyframes cookieSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        style={{
          background: '#2d2d2d', borderRadius: '14px', padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap',
          maxWidth: '640px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        }}
      >
        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, flex: 1, minWidth: '200px' }}>
          We use cookies to understand how visitors use FuneralFair.{' '}
          <Link to="/privacy" style={{ color: '#a8c5aa', textDecoration: 'underline' }}>Privacy policy</Link>
        </p>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={decline}
            style={{
              padding: '7px 14px', fontSize: '13px', fontWeight: 600,
              background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.6)', borderRadius: '8px', cursor: 'pointer',
            }}
          >
            Decline
          </button>
          <button
            onClick={accept}
            style={{
              padding: '7px 16px', fontSize: '13px', fontWeight: 600,
              background: '#4d7a51', border: 'none', color: '#fff',
              borderRadius: '8px', cursor: 'pointer',
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// Exported so footer can trigger the banner again — no page reload needed
export function resetCookieConsent() {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new CustomEvent(RESET_EVENT))
}
