import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://lgqgviyqqubjvuansump.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncWd2aXlxcXVianZ1YW5zdW1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc0OTQ2NCwiZXhwIjoyMDk0MzI1NDY0fQ.TKoT1bPae7-dDL6fI2QDpUjc-KSfqGnpniCD93E0it0'
const BASE_URL    = 'https://funeralfair.co.uk'
const OUT_FILE    = resolve(__dirname, '../public/sitemap.xml')

const STATIC_PAGES = [
  { loc: '/',                                  changefreq: 'weekly',  priority: '1.0' },
  { loc: '/search',                            changefreq: 'weekly',  priority: '0.9' },
  { loc: '/funeral-costs/uk',                  changefreq: 'monthly', priority: '0.9' },
  { loc: '/what-to-do-when-someone-dies',      changefreq: 'monthly', priority: '0.8' },
  { loc: '/government-grants',                 changefreq: 'monthly', priority: '0.8' },
  { loc: '/blog',                              changefreq: 'weekly',  priority: '0.8' },
  { loc: '/blog/what-is-direct-cremation',     changefreq: 'monthly', priority: '0.8' },
  { loc: '/blog/how-much-does-a-funeral-cost', changefreq: 'monthly', priority: '0.8' },
  { loc: '/blog/how-to-compare-funeral-directors', changefreq: 'monthly', priority: '0.7' },
  { loc: '/about',                             changefreq: 'monthly', priority: '0.6' },
  { loc: '/compare',                           changefreq: 'monthly', priority: '0.5' },
  { loc: '/how-we-rank',                       changefreq: 'monthly', priority: '0.5' },
  { loc: '/for-funeral-directors',             changefreq: 'monthly', priority: '0.6' },
  { loc: '/plan-ahead',                        changefreq: 'monthly', priority: '0.5' },
  { loc: '/privacy',                           changefreq: 'yearly',  priority: '0.3' },
]

const CITY_SLUGS = [
  'london', 'manchester', 'birmingham', 'liverpool', 'leeds', 'sheffield',
  'bristol', 'glasgow', 'edinburgh', 'cardiff', 'newcastle', 'sunderland',
  'middlesbrough', 'wigan', 'stockport', 'wirral', 'bradford', 'huddersfield',
  'hull', 'blackpool', 'warrington', 'nottingham', 'leicester', 'coventry',
  'wolverhampton', 'derby', 'stoke-on-trent', 'northampton', 'peterborough',
  'milton-keynes', 'norwich', 'ipswich', 'cambridge', 'luton', 'reading',
  'portsmouth', 'southampton', 'brighton', 'oxford', 'swindon', 'gloucester',
  'bournemouth', 'plymouth', 'exeter', 'aberdeen', 'swansea',
]

function urlTag(loc, changefreq, priority) {
  return `  <url><loc>${BASE_URL}${loc}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`
}

async function fetchAllDirectorIds() {
  const ids = []
  let offset = 0
  const limit = 1000

  while (true) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/funeral_directors?select=id&limit=${limit}&offset=${offset}&order=id.asc`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )
    if (!res.ok) throw new Error(`Supabase error: ${res.status}`)
    const batch = await res.json()
    for (const { id } of batch) ids.push(id)
    if (batch.length < limit) break
    offset += limit
  }

  return ids
}

async function main() {
  console.log('Generating sitemap…')

  const directorIds = await fetchAllDirectorIds()
  console.log(`  ${directorIds.length} director pages`)

  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', '']

  lines.push('  <!-- Core pages -->')
  for (const { loc, changefreq, priority } of STATIC_PAGES) {
    lines.push(urlTag(loc, changefreq, priority))
  }

  lines.push('')
  lines.push('  <!-- City pages — funeral directors -->')
  for (const slug of CITY_SLUGS) {
    const p = slug === 'london' || slug === 'manchester' || slug === 'birmingham' ? '0.9' : '0.8'
    lines.push(urlTag(`/funeral-directors/${slug}`, 'weekly', p))
  }

  lines.push('')
  lines.push('  <!-- City pages — direct cremation -->')
  for (const slug of CITY_SLUGS) {
    const p = slug === 'london' || slug === 'manchester' || slug === 'birmingham' ? '0.9' : '0.8'
    lines.push(urlTag(`/direct-cremation/${slug}`, 'weekly', p))
  }

  lines.push('')
  lines.push('  <!-- Director pages -->')
  for (const id of directorIds) {
    lines.push(urlTag(`/director/${id}`, 'monthly', '0.6'))
  }

  lines.push('')
  lines.push('</urlset>')

  writeFileSync(OUT_FILE, lines.join('\n'), 'utf8')
  console.log(`  Sitemap written → ${OUT_FILE}`)
  console.log(`  Total URLs: ${STATIC_PAGES.length + CITY_SLUGS.length * 2 + directorIds.length}`)
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1) })
