// Prerender — bakes real HTML into pages so crawlers (esp. AI crawlers that
// don't run JS) get real content instead of an empty <div id="root">. Runs
// after `vite build`, against the built dist/ via a local vite preview server
// + Puppeteer.
//
// Phase 1: static content pages (no data fetch).
// Phase 2: city pages (/funeral-directors/:city, /direct-cremation/:city) which
//   fetch directors from the Cloudflare Function. During prerender we intercept
//   those /api/ calls and proxy them to the LIVE production API — no wrangler,
//   no Supabase secrets needed locally.
import { preview } from 'vite'
import puppeteer from 'puppeteer'
import { mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { CITIES } from '../src/data/cities.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(__dirname, '../dist')
const PORT = 4180
const PROD = 'https://funeralfair.co.uk'
const CONCURRENCY = 4

// Phase 1 — static content pages. Canonical routes only.
const STATIC_ROUTES = [
  '/funeral-costs/uk',
  '/what-to-do-when-someone-dies',
  '/government-grants',
  '/blog',
  '/blog/what-is-direct-cremation',
  '/blog/how-much-does-a-funeral-cost',
  '/blog/how-to-compare-funeral-directors',
  '/about',
  '/how-we-rank',
  '/for-funeral-directors',
  '/plan-ahead',
  '/privacy',
  '/compare',
  // NOT '/' — dist/index.html doubles as the SPA fallback (_redirects
  // `/* /index.html 200`). Prerendering it bakes homepage content and
  // canonical="/" into the fallback, so every non-prerendered route (all
  // director pages, cities outside CITIES) would tell Google it is a
  // duplicate of the homepage. Keep index.html as the pristine Vite shell.
  // Don't "fix" this by pointing the fallback at another .html file —
  // Cloudflare Pages strips .html and 308s, which loops the whole site.
  // See ERRORS.md 2026-07-22.
]

// Phase 2 — city pages. `/direct-cremation/derby` 301-redirects to the
// funeral-directors page in prod (_redirects), so it's excluded here.
const citySlugs = Object.keys(CITIES)
const CITY_ROUTES = [
  ...citySlugs.map(s => `/funeral-directors/${s}`),
  ...citySlugs.filter(s => s !== 'derby').map(s => `/direct-cremation/${s}`),
]

function outPath(route) {
  if (route === '/') return join(DIST, 'index.html')
  return join(DIST, route.replace(/^\//, ''), 'index.html')
}

// Proxy any /api/* request the page makes to the live production API, so
// data-driven pages render real content during prerender.
function attachApiProxy(page) {
  return page.setRequestInterception(true).then(() => {
    page.on('request', async req => {
      const url = req.url()
      const i = url.indexOf('/api/')
      if (i !== -1) {
        try {
          const r = await fetch(PROD + url.slice(i))
          const body = await r.text()
          await req.respond({
            status: r.status,
            contentType: r.headers.get('content-type') || 'application/json',
            body,
          })
        } catch {
          try { await req.abort() } catch { /* already handled */ }
        }
      } else {
        try { await req.continue() } catch { /* already handled */ }
      }
    })
  })
}

async function capture(browser, base, route, kind) {
  const page = await browser.newPage()
  await attachApiProxy(page)
  try {
    await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 45000 })
    // Footer renders on every page → proves the React tree mounted.
    await page.waitForSelector('footer', { timeout: 25000 })

    if (kind === 'city') {
      // Wait for the loading spinner to clear (data arrived or errored).
      await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 40000 })
    }
    // Settle for setPageMeta / schema injection / list render.
    await new Promise(r => setTimeout(r, kind === 'city' ? 700 : 600))

    const html = await page.content()
    if (!html.includes('</footer>')) return { route, ok: false, reason: 'no footer' }
    // Don't bake an error page — leave the SPA fallback in place if the API failed.
    if (kind === 'city' && html.includes('Could not load directors')) {
      return { route, ok: false, reason: 'api error' }
    }

    const file = outPath(route)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, html, 'utf8')
    const empty = kind === 'city' && html.includes('No results found')
    return { route, ok: true, size: html.length, empty }
  } catch (e) {
    return { route, ok: false, reason: e.message }
  } finally {
    await page.close()
  }
}

// Simple concurrency pool.
async function runPool(items, worker, n) {
  const results = []
  let idx = 0
  async function next() {
    while (idx < items.length) {
      results.push(await worker(items[idx++]))
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, next))
  return results
}

async function main() {
  const jobs = [
    ...STATIC_ROUTES.map(route => ({ route, kind: 'static' })),
    ...CITY_ROUTES.map(route => ({ route, kind: 'city' })),
  ]
  console.log(`Prerendering ${jobs.length} pages (${STATIC_ROUTES.length} static + ${CITY_ROUTES.length} city)…`)

  const server = await preview({ preview: { port: PORT, strictPort: true }, logLevel: 'warn' })
  const base = `http://localhost:${PORT}`
  const browser = await puppeteer.launch({ headless: true })

  let results
  try {
    results = await runPool(jobs, j => capture(browser, base, j.route, j.kind), CONCURRENCY)

    // Retry any failures sequentially — first-pass failures are almost always
    // transient contention under concurrency, not real errors.
    const retry = results.filter(r => !r.ok).map(r => jobs.find(j => j.route === r.route))
    if (retry.length) {
      console.log(`Retrying ${retry.length} failed page(s) sequentially…`)
      const retried = await runPool(retry, j => capture(browser, base, j.route, j.kind), 1)
      const byRoute = new Map(retried.map(r => [r.route, r]))
      results = results.map(r => byRoute.get(r.route) || r)
    }
  } finally {
    await browser.close()
    await server.close()
  }

  const ok = results.filter(r => r.ok)
  const failed = results.filter(r => !r.ok)
  const empty = ok.filter(r => r.empty)

  for (const r of failed) console.warn(`  ⚠ ${r.route} — ${r.reason}`)
  for (const r of empty) console.warn(`  · ${r.route} — prerendered but 0 directors`)

  console.log(`Prerendered ${ok.length}/${jobs.length} pages${empty.length ? ` (${empty.length} empty)` : ''}${failed.length ? `, ${failed.length} FAILED` : ''}.`)
  if (failed.length) process.exitCode = 1
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1) })
