const BASE = 'https://funeralfair.co.uk'
const DEFAULT_IMAGE = `${BASE}/og-image.png`

function setAttr(selector, value) {
  document.querySelector(selector)?.setAttribute('content', value)
}

function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = url
}

export function setPageMeta({ title, description, path, image }) {
  const url = `${BASE}${path}`
  const img = image || DEFAULT_IMAGE

  document.title = title
  setAttr('meta[name="description"]', description)
  setCanonical(url)
  setAttr('meta[property="og:title"]', title)
  setAttr('meta[property="og:description"]', description)
  setAttr('meta[property="og:url"]', url)
  setAttr('meta[property="og:image"]', img)
  setAttr('meta[name="twitter:title"]', title)
  setAttr('meta[name="twitter:description"]', description)
  setAttr('meta[name="twitter:image"]', img)
}
