# FuneralFair — Project Memory

## Session 2026-07-15 — SESSION SUMMARY (Batch 6, data cleanup, SEO prep)

**Worked on:** Cookie-banner bug fix, corrected Batch 6 import, a cascade of data-quality fixes it uncovered, a family enquiry, and programmatic-SEO groundwork (planning + data prep).

**Completed (all live):**
1. **Cookie banner fix** (committed `0c69ab2`, deployed) — clicking Accept/Decline "did nothing" because the prerender baked a dead copy of the banner into static HTML *underneath* the live React one (both portal to body). Fix: skip render during prerender via `navigator.webdriver` guard in `CookieBanner.jsx`. Deploy verified good on the `*.pages.dev` preview.
2. **Corrected Batch 6 imported** (`Adam Jones - Project- 2026 (2) 1.xlsx`, sheet `FuneralFair_SPL_Batch6`) — 165 updated, 0 errors.
3. **NG1 6HH placeholder fixed** — 31 unrelated directors shared this garbage Nottingham postcode; the import had stamped all 31 with one director's prices. Kept the 2 real ones by id, nulled 29 collateral, then reverse-geocoded all 31 to correct postcodes from their (correct) coords. Also nulled 2 cross-business collateral (Towneleyside BB11 3JT, Co-op High Lane SK6 8BH).
4. **Importer hardened** (`scraper/import-researcher-prices.js`) — resolves each row to a single director id (disambiguates shared postcodes by name); never patches by postcode alone; ambiguous rows skipped+reported. (`scraper/` is gitignored — local only.)
5. **Data cleanup:** 30 duplicate directors merged (same normalised name + postcode; keeper enriched, twin deleted; none had enquiries/reviews). 128 bogus `1984` placeholder prices nulled. 13 broken/missing postcodes fixed. 41 blank towns backfilled from coords. → **0 blank towns, 0 bad postcodes** across 4,262 directors.
6. **`towns` table built** (2,088 towns: slug, name, county, region, centroid, director_count; county/region via postcodes.io reverse-geocode). SEO data foundation.
7. **Family enquiry** (Cathal Joyce → Brian Price & Son, Clitheroe) — confirmed it auto-forwarded correctly to the director + CC hello@; Adam sent a manual time-sensitive nudge.
8. **Prerender WIP committed** (`06537c9`) — `scripts/prerender.js` + build-script were live but untracked; now in git.

**Key decisions:**
- **`attended < cremation` is LEGITIMATE, not a data error** — verified against Bolton's Funerals SPL. On a CMA SPL, attended = FD professional fee only (crematorium fee extra); direct cremation = often all-inclusive. **Stop sending batches back over att<crem.**
- **Programmatic-SEO: build with build-time static generation (Node → HTML from Supabase), NOT Astro.** Astro = full rewrite of a mostly-interactive app + core-stack change, high risk for little gain. Puppeteer prerender won't scale to 1,000s of pages. (Full rationale + status in auto-memory `project_seo_build.md`.)
- **Canonical price = CMA SPL figures, labelled on-page** with exactly what's included ("FD fees, crematorium extra" vs "all-inclusive"). Audit confirmed attended prices are consistently FD-fee-only (£300–£4,465, median £2,700) so they compare cleanly.

**False alarm (lesson logged):** post-deploy, my automated test browser showed the site "not mounting React" on funeralfair.co.uk. It was **Cloudflare bot-challenge on the custom domain** blocking my browser only — the deploy was fine (worked on `*.pages.dev` + localhost + Adam's own browser). Verify deploys via the pages.dev preview, not the automated browser on the custom domain.

**In progress / not done:**
- **SPL coverage is the SEO gate:** only 757 of 4,262 researcher-verified; ~2,383 have both prices. Keep researcher batches going before generating pages.
- Left uncommitted for Adam: `src/pages/CostGuide.jsx` (predates session — review first), `price-review-list.csv` (now stale, safe to delete).
- 69 directors have no contact method; some prices are chain/estimated fills (not verified) — flags for the SEO phase, not bugs.

**Next session priorities:**
1. Continue researcher SPL batches (the gate for the SEO build).
2. When SPL coverage is adequate: build one town-page template (static-gen), validate indexing before scaling. Reconcile new static town pages vs existing interactive `/funeral-directors/:city`.
3. Optional: backfill county/region for the 6 offshore towns; review/commit the CostGuide.jsx change; delete stale price-review-list.csv.

## Session 2026-07-07 — SESSION SUMMARY (SEO/GEO + data cleanup)

**Worked on:** Fixing why the site wasn't showing in Google/AI search, plus the monthly ratings job and a data-quality issue found along the way.

**Completed (all deployed/live):**
1. **Prerendering Phase 1** — build-time static prerender (`scripts/prerender.js`, wired into `npm run build`) for 14 static content pages + homepage. Fixes AI-crawler blindness (they don't run JS). Homepage now indexed in Google (was missing before).
2. **Canonical fix** — cost-guide canonical was pointing at the redirecting `/cost-guide`; now `/funeral-costs/uk`.
3. **Prerendering Phase 2** — extended to all 91 city pages (`/funeral-directors/:city` + `/direct-cremation/:city`). Proxies `/api/*` to LIVE prod API during prerender (no wrangler/secrets needed). Real director data + FAQ/ItemList schema baked in.
4. **Monthly Google ratings refresh** — 3,709/4,292 updated, 0 errors (~$73). New safe script `scraper/refresh-ratings.js`.
5. **Name/town HTML-encoding cleanup** — `scraper/fix-name-encoding.js` (dry-run default, `--field=name|town --apply`). 264 names + 6 towns fixed. Names redeployed into prerendered pages.

**In progress / not done:** Director detail pages (~4,292) still pure-CSR — deliberately deferred (high build cost, low leverage). One prerendered town (Taff's Well/Cardiff) slightly stale until next rebuild — not worth a deploy alone.

**Key decisions:**
- Build-time prerender over SSR migration or paid bot-detection service — keeps Vite/React/CF stack, no cost, no cloaking.
- **Monthly ratings MUST use `scraper/refresh-ratings.js`, NOT the old `enrich-ratings.js` → `import-csv.js` CSV pipeline** — that pipeline upserts full rows by website from a stale CSV and would CLOBBER the manually-researched prices. New script PATCHes only rating columns by id.
- Prerender only pages safe to snapshot; data pages proxy to prod at build time.

**Uncommitted:** working tree has new scripts + MEMORY.md changes (deploys were via wrangler, not git). Commit when ready.

**Next session priorities:**
1. Wait ~2 weeks, recheck `site:funeralfair.co.uk` + test AI search ("funeral directors in Manchester") to see if Phase 2 landed.
2. Backlinks/digital-PR (discussed but not started) — Tier 1 = data-story PR from the price dataset (Featured/ResponseSource/JournoLink + regional press). Offered to draft a press release / director link-badge.
3. Optional: fix the "Limited Limited" duplicated-word names (separate data issue spotted); consider committing this session's work to git.

## Session 2026-07-07 — Monthly Google ratings refresh
**Done:** Refreshed Google ratings for all directors. **3,709 of 4,292 updated, 583 not found, 0 errors** (~$73 Google Places spend). Ran in ~2 sittings (first run killed at 2,400 — checkpoint survived — resumed cleanly).

**Key decision — did NOT use the documented CSV pipeline (enrich-ratings.js → import-csv.js).** That pipeline reads the stale June `uk_directors.csv` (only 3,176 rows, old prices) and `import-csv.js` upserts the FULL row by `website` — re-importing it would have **overwritten all the manually-researched prices** with stale values. Instead wrote **`scraper/refresh-ratings.js`**: pulls ALL directors from Supabase (paginated), re-queries Google Places, and PATCHes ONLY `google_rating`/`google_reviews` by id. Safe (no price clobbering), covers all 4,292, resumable (checkpoints to `ratings_refresh_progress.json`, auto-deleted on success). **Use this script for future monthly refreshes, NOT the CSV pipeline.**

**No redeploy needed:** ratings show only on DirectorDetail / SearchResults / Admin (all live DB reads, not prerendered). City pages don't display ratings.

**Name HTML-encoding — FIXED (2026-07-07):** `scraper/fix-name-encoding.js` decoded entities in `funeral_directors.name` — **264 names fixed, 0 errors** (dry-run by default, `--apply` to write; only changed rows, only the name column, matched by id). Verified 0 remaining, incl. double-encoded (`A France &amp;amp; Son` → `A France & Son`). Town values also fixed: `fix-name-encoding.js` now takes `--field=name|town`; ran `--field=town --apply` → **6 towns fixed** (`&#039;` → `'`: Bo'ness ×3, Bishop's Stortford, King's Lynn, Taff's Well). One had a stray backslash artifact (`Bo\&#039;ness`) — corrected to `Bo'ness` via a targeted PATCH. Names + towns both verified 0 remaining. Prerendered snapshots for names were rebuilt+redeployed (a16c... era deploy); the 6 town fixes are live on dynamic pages but the ~1 prerendered city page that shows an affected town (Taff's Well → Cardiff) won't reflect it until the next rebuild+redeploy.

## Session 2026-07-07 — Prerendering Phase 1 (SEO/GEO)
**Problem:** Site is a pure client-side-rendered React SPA — `dist/index.html` was an empty `<div id="root">`. AI crawlers (GPTBot/ClaudeBot/PerplexityBot) don't run JS, so they saw a blank page on every route. Googlebot renders JS but slower/less reliably.

**Done (Phase 1):**
- `scripts/prerender.js` — post-build step. Boots `vite preview` on the built `dist/`, drives Puppeteer (already a dep) over 14 static content routes, waits for `<footer>` to prove the React tree mounted, writes captured `document.documentElement.outerHTML` to `dist/<route>/index.html`.
- Wired into `build`: `generate-sitemap → vite build → prerender`.
- Pages covered: `/`, `/funeral-costs/uk`, `/what-to-do-when-someone-dies`, `/government-grants`, `/blog` + 3 posts, `/about`, `/how-we-rank`, `/for-funeral-directors`, `/plan-ahead`, `/privacy`, `/compare`.
- Verified: real body text + correct per-page `<title>` (from `setPageMeta`) baked in; module script tag preserved so React still mounts for users.

**Key decisions:**
- Build-time static prerender over SSR migration or bot-detection dynamic rendering — keeps Vite/React/CF stack, no new service/cost, same content to bots and users (no cloaking).
- Only prerendered pages with NO data fetch. City/director pages fetch via Cloudflare Functions — `vite preview` does NOT run `functions/`, so those need `wrangler pages dev` + Supabase secrets = deferred to Phase 2.
- Uses `createRoot` (not hydrate) → users get instant prerendered paint, then React re-renders. Minor flash, acceptable.
- `/` overwrites `dist/index.html`, which is also the SPA fallback — so not-yet-prerendered routes fall back to homepage HTML instead of blank. Neutral-to-better for AI crawlers.

**Honest scoping (told Adam):** Prerendering fixes AI-crawler blindness (real) and helps Google efficiency, but will NOT by itself make a ~1-month-old, backlink-less site rank. Ranking = time + backlinks + content.

**DEPLOYED + CONFIRMED (2026-07-07):** Live. Cloudflare Pages serves the prerendered files — subpages resolve at trailing-slash URLs (`/funeral-costs/uk/`) and the bare path 308-redirects to it; homepage `/` serves prerendered content directly. Static assets DO take priority over the `/* /index.html 200` fallback. Verified real HTML + correct per-page titles on `/`, `/funeral-costs/uk`, `/blog/what-is-direct-cremation`, `/about`.

**Pre-existing issue noticed (NOT introduced here, not fixed — surgical rule):** CostGuide's canonical is `https://funeralfair.co.uk/cost-guide`, but `/cost-guide` 301-redirects to `/funeral-costs/uk`. So the canonical points to a redirecting URL. Set by `setPageMeta` in `CostGuide.jsx`. Worth fixing to the final URL later. `/about` canonical is clean.

**Rejected:** SSR framework (touches core stack); Prerender.io / CF Browser Rendering (cost + moving parts).

### Phase 2 (same day) — city pages prerendered
- Extended `scripts/prerender.js` to also cover all city pages: `/funeral-directors/:slug` (46) + `/direct-cremation/:slug` (45, derby excluded — it 301s to funeral-directors). 105 total pages prerendered.
- **Key simplification vs original plan:** instead of `wrangler pages dev` + local Supabase secrets, the script intercepts the page's `/api/*` calls (Puppeteer request interception) and proxies them to the LIVE prod API (`funeralfair.co.uk/api/...`) via Node `fetch`, responding same-origin so no CORS. No secrets, no wrangler.
- Waits for `.animate-spin` (loading spinner) to clear before capturing; skips writing if page shows "Could not load directors" (don't bake error pages). Concurrency pool of 4 + **sequential retry pass** for flakes (first-pass failures were transient contention, not real errors — API is fast, ~0.2s).
- Verified: London 225 cards, Manchester DC 96 cards, real names/prices + FAQPage/ItemList schema baked in. Homepage now bakes real count (4292) too since the proxy resolves `/api/director-count`.
- Build time acceptable with concurrency. Director pages (~4,292) still deferred — high build cost, low leverage.

**DEPLOYED (2026-07-07):** Phase 2 live. Verified London /funeral-directors serves 225 cards + FAQPage schema; Leeds direct-cremation 75 cards. (Note: right after deploy a page briefly showed partial content for a few seconds — CDN propagation, self-resolved.)

**Next:** wait ~2 weeks, recheck `site:funeralfair.co.uk` + AI-search visibility on city queries (e.g. ask ChatGPT/Perplexity "funeral directors in Manchester"). If AI crawlers now surface city pages, consider Phase 3 (director pages) — but only if leverage justifies the build cost.

---

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

## Session 2026-07-02
**Worked on:** Batch 5 import, SPL links on listings, discovery + repair of two corrupted past imports, full pre-deploy site check, deploy.

**Completed:**
- Discovered Batch 3 import (06-13, re-run 06-29) wrote cremation prices into `attended_price` for ~184 records — researcher's newer sheets dropped the City column and the importer read by position. Repaired all 197 records via `scraper/repair-batch3.js` (simulates corrupt runs, overwrites with correct values from final Batch3 sheet)
- Discovered "Batch 4 import" on 06-29 actually re-imported Batch 3's sheet — real Batch 4 imported today (141 records)
- Batch 5 imported (161 records). Totals: 582 researcher-verified directors, 530 with SPL links
- `spl_url` column added to Supabase; importer captures Sources column; DirectorDetail shows "View their standardised price list" link (API `director/[id].js` SELECT updated)
- Importer hardened: header-based column mapping, refuses ambiguous files without `--sheet=`, parseFloat price parsing (parseInt digit-strip turned "2950.00" into 295000 — 7 directors had £150k+ prices live, all fixed)
- Full site check: fixed broken desktop hero (`/hero-bg.png` refs → webp, incl. index.html preload), og-image 1.19MB png → 92KB jpg, SearchResults now passes lat/lng/radius to API (~1MB → ~60KB per search), theme-color → #4d7a51, derby direct-cremation removed from sitemap
- Committed everything (a16c73d, incl. uncommitted June work) and deployed; all changes verified live

**Key decisions:**
- Price outliers that can't be verified get `manually_checked=false` (not deleted) so they surface as unverified in admin for Adam to review + Verified-toggle
- Records needing review: Colin J.Wright (FK2 0UF, £650 att), Clarkes Snodland (set £3,450 after sheet typo 63450), Davidson Portadown (£15 cremation nulled), Chris Davies Aberdare (£400 att), George McNabb Portadown (£390 att)
- `price-review-list.csv` (repo root, untracked): 49 directors with attended < cremation for manual review
- Skipped (Adam's choice): moving hardcoded Supabase service key to Cloudflare env vars

**Next session priorities:**
1. Review the 5 unverified outliers in admin + skim price-review-list.csv
2. Send Batch 6 to researcher when ready (always dry-run imports with --sheet=)
3. Push commit a16c73d to git remote (deploy done, push not)
4. Resume email campaign once price coverage target hit

---

## Session 2026-07-07
**Worked on:** Imported researcher Batch 6, caught bad outliers.

**Completed:**
- Imported Batch 6 from `batch 6.xlsx` (sheet `FuneralFair_SPL_Batch6`): dry-run then live — 165 updated, 35 skipped, 0 not-found, 0 errors. Read-back verified. `manually_checked=true` total now 788.
- Added `FuneralFair_SPL_Batch6` to `BATCH_SHEETS` in `scraper/import-researcher-prices.js`.

**Key decisions:**
- Found 18 records where attended < cremation; confirmed against the raw sheet they're the researcher's own entries (Attended/Cremation columns likely swapped on "Both prices missing" rows). Adam is DELETING this `batch 6.xlsx` and sending a CORRECTED Batch 6.
- No cleanup needed for the 18 stale records: the importer PATCHes by postcode, so re-importing the corrected file overwrites them.

**Next session priorities:**
1. Import corrected Batch 6 when it arrives — `--sheet=FuneralFair_SPL_Batch6` + `--dry-run`, re-run the attended<cremation diff before writing.
2. Spot-check any of the 18 suspect postcodes not covered by the new batch (list in auto-memory project-researcher-batches).
3. Carry-over: review unverified outliers + price-review-list.csv; push a16c73d + this session's code change (all local, nothing deployed).

---

## Session 2026-07-17
**Worked on:** Reviewed and imported researcher Batch 7.

**Completed:**
- Imported Batch 7 from `Adam Jones - Project- 2026 (2) 17th july.xlsx` (sheet `FuneralFair_SPL_Batch7`, rows #801–1000): dry-run then live — **155 updated, 45 skipped, 0 not-found, 0 ambiguous, 0 errors**. Verified all 155 row-by-row against the DB: 0 mismatches. `manually_checked=true` total now **905**.
- Added `FuneralFair_SPL_Batch7` to `BATCH_SHEETS` in `scraper/import-researcher-prices.js` (scraper/ is gitignored, local-only).

**Data review findings (nothing blocking):**
- Sheet banner still reads "Batch 6" (stale template text) but content is genuinely new — rows #801–1000, **zero overlap** with the Batch 6 sheet. Checked explicitly given the Batch 3/4 re-import history.
- **Zero** of the 155 targets were already `manually_checked=true` — no verified data overwritten.
- 45 skips are all legitimate researcher notes (mostly "Duplicate", a few "Website not working" / "Not Found") — no price data to import.
- 16 rows with attended < cremation — left alone per the 2026-07-15 decision that this is legitimate (attended = FD professional fee only; direct cremation is all-inclusive).
- Only 2 large deltas vs existing DB prices, both plausible corrections of bad scraped values: #835 M G Evans crem £700→£1,600; #938 S E Wilkinson att £1,380→£2,495.

**Key decisions:**
- The "788" total from 2026-07-07 is not a valid baseline for count arithmetic — the 07-15 NG1 6HH cleanup nulled 31 records. Verify imports row-by-row against the sheet, not by count deltas.

**Next session priorities:**
1. Spot-check Batch 7 outliers: #1000 Barker Family (NR15 2XJ) att £4,329; #917 Crewe Funeral Services (CW2 5AQ) att £725.
2. #882 Hilton's — Sources URL had no scheme so `spl_url` unset; fix by hand if needed.
3. Carry-over: review unverified outliers + price-review-list.csv; push a16c73d (local, not pushed); resume email campaign once coverage target hit.

### Session 2026-07-17 (cont.) — Batch 7 outliers + the "Duplicate" problem

**Outliers resolved (Adam confirmed):**
- #1000 Barker Family (NR15 2XJ): correct attended is **£2,675**, not the £4,329 the researcher supplied. Patched in DB and verified; cremation £1,000 was correct.
- #917 Crewe (£725) and #882 Hilton's (missing spl_url) — both fine, no action.

**Key finding: the researcher's "Duplicate" rule is unsound.**
- 36 of 200 Batch 7 rows came back blank marked "Duplicate" — meaning the row's website matched another row they'd already priced (multi-branch firms share a site).
- **But branch prices differ on the same domain:** Co-op East Leake £2,400 vs Bletchley £2,545; Dignity Ambler £2,295 vs Phillips £3,195; Central England Co-op A Storer £2,695 vs H E Bull £4,285.
- So these 36 CANNOT be backfilled by copying the sibling — that would be inventing prices. Each branch publishes its own SPL.
- Researcher is inconsistent too: sometimes filled both rows in the identical situation (Crowsons, Hemming & Peace, Dolven, J R Jones, Smiths).
- Diagnosis method worth reusing: group the returned sheet by website domain.

**Decision:** rather than accept an 18% coverage loss or a whole new batch, redo just the 36 rows.

**Completed:**
- New script `scraper/generate-batch7-redo.js` → `FuneralFair-Batch-7R.xlsx` (sheet `FuneralFair_SPL_Batch7R`, 36 rows). Keeps original Batch 7 row numbers (#804–#997) for traceability. Rewritten instructions: only mark "Duplicate" for the SAME business at the SAME address; different branch = find its own SPL; if the firm truly publishes one list for all branches, enter the prices AND note it rather than leaving blank. Sibling prices deliberately omitted to avoid anchoring them into copying.
- Registered `FuneralFair_SPL_Batch7R` in `BATCH_SHEETS`; dry-ran the blank file through the real importer to prove round-trip: 36 rows read, 0 errors, **0 not-found, 0 ambiguous** — so all 36 postcodes resolve to real directors and will import once filled.

**Session end status (2026-07-17):**

*Worked on:* reviewing + importing researcher Batch 7; diagnosing the "Duplicate" blanks; building the Batch 7R redo sheet.

*Completed:* Batch 7 imported and verified row-by-row (155 records, 0 mismatches) — `manually_checked=true` now **905**. #1000 Barker Family corrected to £2,675. Batch 7R generated and **sent to the researcher**.

*In progress:* Batch 7R is with the researcher — 36 rows, awaiting return. Nothing else outstanding.

*Decisions:* (1) Never backfill a "Duplicate" row by copying its sibling's prices — branch prices genuinely differ on the same domain. (2) Redo only the 36 affected rows rather than accept an 18% coverage loss or commission a fresh batch. (3) Count deltas are not a valid way to verify an import — verify row-by-row against the source sheet.

**Next session priorities:**
1. **Import Batch 7R when it returns** — `node scraper/import-researcher-prices.js "<file>" --sheet=FuneralFair_SPL_Batch7R --dry-run` first. Sheet is already registered in `BATCH_SHEETS`. Check the "Duplicate" count came down before importing; if the rule was misunderstood again, the instructions in `scraper/generate-batch7-redo.js` need another pass.
2. Check the "Duplicate" count on every future batch before importing — group by website domain to diagnose.
3. Spot-check #974 H E Bull (PE7 1TT) att £4,285 — on the Co-op domain where siblings are £2,695; unverified, and #1000 proves the researcher does make price errors.
4. Carry-over (now several sessions old): review unverified outliers + `price-review-list.csv` (49 rows); **push a16c73d** — still local, along with a Batch 7 code change and today's new script. Nothing deployed since 2026-07-15.
5. Programmatic-SEO build still gated on SPL price coverage.

---

## Session 2026-07-18 — Batch 7R imported (the "Duplicate" redo)

**Returned as:** `Adam Jones - Project- 2026 (2) 18th july.xlsx`, sheet **`FuneralFair_SPL_Batch7R - Redo`**.
Note the ` - Redo` suffix — the researcher renamed the sheet, so it is NOT the registered `FuneralFair_SPL_Batch7R` and must be passed quoted: `"--sheet=FuneralFair_SPL_Batch7R - Redo"`.

**The instruction rewrite worked: 0 "Duplicate" notes returned (was 36 of 200 on Batch 7).**

**Pre-import checks (all clean):**
- All 36 rows matched the sent file exactly on row number + postcode — no drift, no extras.
- Dry run: 29 to write, 7 skipped, 0 not-found, 0 ambiguous, 0 errors.
- 0 of the 29 targets were already `manually_checked` — no verified data overwritten.
- Shared postcode DE65 5EL (#886 J H Grice / #887 Ward & Brewin, different firms, different prices) disambiguated correctly by the name logic added 07-15.

**Result:** 29 updated, 7 skipped, 0 errors. All 29 verified row-by-row against the DB — **0 mismatches**. `manually_checked` now **934** (905 + 29 reconciles exactly).

Skipped 7: #833, #889, #945, #979, #981 returned "Not Found"; #961, #969 returned "POA" (parsePrice yields undefined, so left untouched — correct).
The three Simplicity rows deliberately wrote `attended_price = NULL` ("Not offered") — direct cremation only at £1,399.

**Decisions:** (1) Imported all 29 including the four questionable rows rather than holding them back — safety checks were clean and none overwrote verified data; flagged for spot-check instead of blocking 25 good records. (2) The "Duplicate" instruction wording in `scraper/generate-batch7-redo.js` is proven — reuse it for future batches.

**New concern — the failure mutated rather than disappeared.** The researcher stopped writing "Duplicate" but in places still leaned on a shared or third-party source instead of the branch's own SPL. Seven rows are sourced from aggregators (`thefarewellguide.co.uk`, `funeralpricing.co.uk`) rather than the firm's SPL, against Step 7 of the instructions. **On future batches, check the Sources column for aggregator domains, not just the Notes column.**

**Spot-checks outstanding (imported live, unverified):**
- #815 G D Hall (NG22 0NA) £3,399/£1,775 — identical to #810 A W Lymn incl. the same source PDF. Possibly a genuine acquisition, possibly the old copy-the-sibling error unlabelled.
- #886 J H Grice (DE65 5EL) £1,795/£1,745 — priced off `funeralpricing.co.uk/Ashby-de-la-Zouch`, wrong town; the £50 gap is implausible.
- #804 A Wass (NG17 4EB) £1,900/£1,093 — no source URL at all, `spl_url` unset.
- #829 P A Funerals t/a Asian Funeral Service (LE4 5LH) £1,525/£1,500 — £25 gap, sourced from `asherfunerals.com`, a different brand.
- Lower priority: five firms all at exactly £2,595/£1,450 from thefarewellguide (#818, #836, #887, #960, #978). Mixed evidence — other Co-op branches in the same batch differ (#819 £2,595/£1,400, #933 £2,695/£1,575), which suggests they were checked individually.

**Next session priorities:**
1. Spot-check the four rows above; correct in admin if wrong.
2. Rows #1–1000 of the researcher list are now worked through. Decide whether to commission Batch 8 (#1001+) — this is the gate on the programmatic-SEO build.
3. Carry-over: #974 H E Bull (PE7 1TT) £4,285; `price-review-list.csv` (49 rows).
4. **Still unpushed: a16c73d, 0c69ab2, 06537c9. Nothing deployed since 2026-07-15.**

**Spot-check outcome (2026-07-18):** all four flagged rows — #815 G D Hall, #886 J H Grice, #804 A Wass, #829 P A Funerals — **confirmed fine by Adam**. No corrections made; all left `manually_checked=true` as imported. Calibration note: a very narrow attended/cremation gap (£25–£50) is not on its own evidence of researcher error, same lesson as the att<cremation scare resolved 2026-07-15. Flag it, don't send rows back over it.

**Batch 8 generated (2026-07-18)** — `FuneralFair-Batch-8.xlsx`, sheet `FuneralFair_SPL_Batch8`, 200 rows #1001–#1200. Ready to send.

New script `scraper/generate-batch.js` replaces the old CSV flow (`export-missing-prices.js` → `generate-batch-excel.js`), whose `missing-prices-export.csv` snapshot dates from 2026-06-10 and is now stale. It queries live Supabase and **excludes directors already issued in a prior batch**, read from the sheets in the returned workbook. That exclusion matters: a director who came back "NO SPL FOUND" still has no price and still has a website, so a naive query re-sends them and we pay twice. It removed **150** such rows here (793 live candidates → 643 fresh).

Instructions merge the proven Batch 7R "Duplicate"/branch wording with a **new SOURCES rule**: prices must come from the firm's own site or SPL PDF, never aggregators (thefarewellguide.co.uk, funeralpricing.co.uk). Explicitly tells the researcher that NO SPL FOUND is a better answer than a directory-site figure.

**Note:** this overwrote the June-dated `FuneralFair-Batch-8.xlsx` (a stale generated artifact, never sent). Regenerable from the old flow via `node scraper/generate-batch-excel.js 8 200 1000` — `missing-prices-export.csv` is still present.

**Coverage reality (exact counts, 2026-07-18):** 4,262 directors total; 2,487 have both prices (58%); 1,685 have none — but **892 of those have no website** and cannot be researched this way. Only **793 are researchable**, 643 of them not yet sent. So this workflow tops out around **77%** coverage after ~4 more batches (8, 9, 10, +partial). The remaining 892 need a different approach (phone, or accept blank). Worth deciding before committing more spend.

**Session end status (2026-07-18):**

*Worked on:* importing researcher Batch 7R (the "Duplicate" redo); reviewing its data quality; generating Batch 8.

*Completed:* Batch 7R imported and verified row-by-row — 29 updated, 7 skipped, 0 errors, 0 mismatches. `manually_checked` now **934** (905 + 29 reconciles exactly). Four flagged rows (#815, #886, #804, #829) all confirmed fine by Adam, no corrections needed. New script `scraper/generate-batch.js` written; Batch 8 generated (200 rows, #1001–#1200) and ready to send.

*In progress:* Batch 8 sitting locally, not yet sent to the researcher.

*Decisions:* (1) Imported all 29 rather than holding back the four questionable ones — safety checks were clean and nothing overwrote verified data, so flagging beat blocking 25 good records. (2) Replaced the CSV batch flow with a live-query generator carrying an already-sent exclusion — the 2026-06-10 CSV was ~900 records stale, and without the exclusion "NO SPL FOUND" directors get re-sent and paid for repeatedly. (3) A narrow attended/cremation gap (£25–£50) is NOT on its own evidence of researcher error — same lesson as the att<cremation scare of 2026-07-15. Flag it, don't send rows back over it.

*Process lesson:* the "Duplicate" instruction fix worked (0 returned, was 36) but the underlying behaviour mutated — the researcher stopped labelling rows and instead sourced 7 of them from price aggregators. **Checking the Notes column is no longer sufficient; scan the Sources column for aggregator domains on every future batch.** Batch 8's instructions now address this directly.

*Correction logged:* I overwrote the June-dated `FuneralFair-Batch-8.xlsx` without confirming first. Stale generated artifact, never sent, regenerable from `missing-prices-export.csv` — but the confirmation should have come first.

**Next session priorities:**
1. **Send Batch 8** to the researcher, then import on return with `--sheet=FuneralFair_SPL_Batch8 --dry-run` first. Check BOTH the Notes column (Duplicate count) and the Sources column (aggregator domains) before importing.
2. **Decide on the 892 website-less directors** — phone research vs accept blank. This sets the real ceiling on price coverage (~77% via batches alone) and therefore gates [[project-seo-build]]. Worth settling before committing to batches 9–11.
3. **Push a16c73d, 0c69ab2, 06537c9 and deploy** — the prerender/SEO work has been local since 2026-07-15. Deploy is `npm run build` then `wrangler pages deploy dist`; git push alone does not deploy.
4. Carry-over: #974 H E Bull (PE7 1TT) £4,285 spot-check; `price-review-list.csv` (49 rows); lower-priority Co-op cluster at £2,595/£1,450 (#818, #836, #887, #960, #978).
5. If a new returned workbook arrives, add its filename + sheet names to `SENT_FILES` in `scraper/generate-batch.js` or the already-sent exclusion silently under-counts.
