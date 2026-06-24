# FuneralFair — Project Memory

## Session 2026-06-04 (major session)
**Worked on:** Geocoding infrastructure, city pages overhaul, data cleanup, interactive map, UX hardening.

**Completed:**
- Added `lat`/`lng` columns to Supabase, geocoded all ~3,300 directors via postcodes.io, then re-geocoded ~2,564 with precise Google Places coordinates
- City pages switched from fetching all directors to bounding box query — load time 5–10s → <1s
- 40 cities in `src/data/cities.js` (was 22)
- Interactive map on SearchResults (Leaflet + OpenStreetMap, free, toggle not default-on)
- "Listing verified" badge on cards + detail page when `claimed_at` is set
- "List your business for free" section on homepage for director acquisition
- Navbar breakpoint sm → lg, mobile city stats labels shortened, "Price on request" for bare dashes
- Branded sage-green favicon replacing Vite default
- CSP in `_headers` updated to allow OpenStreetMap tiles

**Key decisions:**
- Leaflet + OpenStreetMap over Google Maps — free, no API cost
- Map is a toggle (not default-on) — respects sensitive audience
- "Listing verified" wording (not "Verified") — avoids implying other listings are untrustworthy
- `makePin` hoisted to module level — Leaflet DivIcon objects created once
- One-row-per-branch for multi-location chains
- All Supabase calls proxied through Cloudflare Workers — browser never calls Supabase directly
- City name searches resolve via CITIES object before hitting postcodes.io

**Rejected approaches:**
- Google Maps — cost and API key exposure risk
- Fetching all directors then filtering in-browser — too slow at 3,300+ rows

---

## Session 2026-06-05
**Worked on:** Created MEMORY.md and ERRORS.md. Continued city price fills.

**Price coverage at session start (58% avg both-prices across 40 cities):**
- Priority cities: Portsmouth 36%, Peterborough 38%, Brighton 41%, Blackpool 43%, Ipswich 43%

**Completed this session:**
- All 40 cities scraped for prices (now resumable progress files exist for all)
- 62 Co-op branches filled via SPL PDFs (Southern Co-op att=£3,265/crem=£1,240, Lincolnshire att=£2,545/crem=£1,495)
- 43 non-funeral-director records deleted (headstone companies, grave care, florists, etc.)
- Bad geocoding records fixed/deleted (5 records)
- Simplicity Cremations attended_price incorrectly set — fixed to null for all 12 affected branches
- NAFD/SAIF badges moved below director name on search cards (layout bug fix) — deployed
- Price coverage: 58% → 61% across 1,152 directors in 40-city index

**Manual price list progress (missing-prices.txt):**
- Adam working through list manually, got through London → Liverpool (in priority order)
- Stopped at Liverpool — resume next session from Sheffield onwards
- List is at: `missing-prices.txt` in project root

**Next session priorities (from 2026-06-05 session):**
- Resume manual price fills from Sheffield in missing-prices.txt
- Email campaign: 784 directors have emails + not yet contacted — ready to send
- Email scraping: 592 directors have no email — build scraper when needed
- Deploy after any significant data or code changes: `npm run build && npx wrangler pages deploy dist --project-name funeralfair --branch main`

---

## Session 2026-06-05 (continued — major session)

**Worked on:** Full director dashboard + login system, data cleanup, UX fixes, admin improvements.

### Data
- `missing-prices.txt` generated — all 1,429 directors missing prices ranked by city population. Adam manually reviewed London → Liverpool. Resume from Sheffield next session.
- Co-op SPL scraper built: `node scraper/fill-coop-prices.js` — fills Southern Co-op (att=£3,265/crem=£1,240) and Lincolnshire Co-op (att=£2,545/crem=£1,495). 62 branches filled. Run monthly.
- National Co-op (coop.co.uk) blocked by Imperva — cannot scrape. East of England Co-op has no price data in accessible HTML.
- 43 non-funeral-director records deleted (headstones, grave care, celebrants, florists, pet cremation, software companies, etc.)
- St John's College Chapel (Cambridge) deleted
- Bad geocoding: deleted 3 fake/invalid records, fixed coords on 2 real ones
- Simplicity Cremations: 12 branches had attended_price incorrectly set — nulled out (direct cremation only)
- Database: added columns `description`, `opening_hours`, `facebook_url`, `instagram_url`, `specialisms` (text[]), `faqs` (jsonb) for featured directors

### Director dashboard system (major build)
- `/dashboard/:token` — new unified dashboard using `claim_token` (works for free + featured)
- `/director-login` — email-based magic link login ("enter your email, get your link")
- `functions/api/director/send-dashboard-link.js` — sends dashboard link, rate-limited (3/IP/10min)
- Claim confirmation email now includes dashboard link; only sends on FIRST claim (not every save)
- Navbar: "Manage listing" button added (desktop outlined button + mobile menu item)

**Free vs Featured dashboard:**
- Free: 1 photo, basic edit (prices/contact), locked sections visible to drive upsell
- Featured: 10 photos, description (1000 chars), special offer (presets + custom), opening hours, Facebook/Instagram links, specialisms (15 tags), FAQs (up to 6 Q&As)
- Photo limit enforced server-side in `upload-photo.js`
- All featured fields shown locked on free dashboard with "Upgrade to Featured" CTAs

**Public listing (DirectorDetail.jsx) — featured additions:**
- Special offer banner (tag icon, sage green, top of listing)
- Business description ("About" section)
- Opening hours in contact card
- Facebook/Instagram links in contact card
- Services & specialisms tag pills
- FAQ accordion section

### UX fixes
- NAFD/SAIF badges on search cards were overlapping director name — fixed (moved below name, same column)
- Toggle for special offer: replaced fragile inline-style toggle with accessible `role="switch"` button
- Invalid token page now has "Get a new dashboard link" button → `/director-login`
- Featured photo limit shows clear message instead of silently hiding upload widget

### Admin panel improvements
- Removed `verified` toggle (was inert/confusing)
- Added read-only "Claimed" status block in director edit modal: shows claimed date + "View dashboard →" link
- "Verified" stat card replaced with "With email" stat
- `claim_token` added to admin API so dashboard link works in modal
- Old `/director/dashboard` route and `DirectorDashboard.jsx` removed (superseded by new `/dashboard/:token`)

### Housekeeping
- `missing-prices.txt` and scraper progress/output files added to `.gitignore`
- `ERRORS.md` created (empty log for future error tracking)

**Key decisions:**
- Token-based auth for directors (no passwords) — email → get link → bookmark it
- Free tier: 1 photo. Featured tier: 10 photos. Both enforced server-side.
- Emails (claim confirmation + Adam notification) only fire on first claim, not dashboard saves
- `verified` boolean deprecated in admin — `claimed_at` is the meaningful indicator

**Email campaign status:**
- 252 directors contacted via system (`claim_email_sent_at` tracked)
- 784 have email + not yet contacted — next action
- 1,880 have no email at all

**Next session priorities:**
1. Resume manual price fills — Sheffield onwards in `missing-prices.txt`
2. Start email campaign to the 784 uncontacted directors with emails
3. Email scraping for the 592 with no email (lower priority)
4. Monthly ratings refresh: `node scraper/enrich-ratings.js` then import (due ~July 2026)
