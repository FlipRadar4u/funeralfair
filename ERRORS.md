# FuneralFair — Error Log

Log any approach that took more than 2 attempts to work. Check here before trying similar things.

---

## Format
**Problem:** what we were trying to do
**What didn't work:** approach(es) that failed, and why
**What worked:** the solution
**Note for next time:** key takeaway

---

<!-- Entries added as problems are encountered -->

## Researcher import corrupted prices via positional column mapping (found 2026-07-02)
**Problem:** Import researcher Excel batches into Supabase (`scraper/import-researcher-prices.js`).
**What didn't work:** Reading columns by fixed position (attended = column 7, cremation = column 8). The researcher's newer sheets dropped the "City / Region" column, shifting everything left by one. Batch 3 (imported 2026-06-13) wrote the cremation price into `attended_price` for ~184 records — live on the site for weeks. Also, auto-picking the first recognised sheet name meant the 2026-06-29 "Batch 4" run silently re-imported Batch 3's sheet; Batch 4 was never imported.
**What worked:** Locate columns by header text (`hdr.findIndex(h => h.includes('attended'))` etc.), and refuse to run when the file contains multiple known batch sheets unless `--sheet=NAME` is passed. One-off `scraper/repair-batch3.js` re-simulated the corrupt runs to find exactly which fields held garbage, then overwrote with correct values from the final Batch 3 sheet.
**Note for next time:** Never trust column positions in third-party spreadsheets — map by header. After any import, spot-check a handful of records in the DB against the source file (attended should usually be higher than cremation). Identical result counts across two "different" imports (184/16 twice) are a red flag that the same data was imported twice.

## parsePrice mangled decimal prices (found 2026-07-02)
**Problem:** Importing researcher prices where some cells contained pence, e.g. "2950.00".
**What didn't work:** `parseInt(s.replace(/[^0-9]/g, ''))` — strips the decimal point, so "2950.00" became 295000. Put £295,000 attended funerals live on the site, marked as verified.
**What worked:** `Math.round(parseFloat(s.replace(/[^0-9.]/g, '')))` in both `import-researcher-prices.js` and `repair-batch3.js`, then re-ran the imports.
**Note for next time:** After every import, run an outlier scan: attended > £8,000, attended < £500, cremation < £300, and attended < cremation are all red flags. Also check the site's `/hero`-style static assets after renaming files — `/hero-bg.png` 404'd for days because the SPA fallback masks missing assets with a 200 + HTML response.

## SPA fallback rewrite to a .html file took the whole site down (2026-07-22)
**Problem:** The prerender step writes the rendered homepage to `dist/index.html`, which is also the SPA fallback target in `_redirects` (`/* /index.html 200`). So every non-prerendered route (all 4,262 director pages, any city outside the 91 prerendered ones) served full homepage HTML declaring `canonical="https://funeralfair.co.uk/"` — telling Google they were all duplicates of the homepage.
**What didn't work:** Preserving the pristine Vite shell as `dist/app.html` and pointing the fallback at it (`/* /app.html 200`). **This broke production entirely** — every URL, including `/`, returned `308 -> /app` in an infinite redirect loop. Cause: Cloudflare Pages strips `.html` from URLs, so it 308-redirects `/app.html` to `/app`; a `_redirects` 200-rewrite whose *target* is a `.html` file gets turned into a redirect, and since `/*` also matches `/app`, it loops forever. Site was down roughly 6 minutes.
**What worked:** Immediate revert of the `_redirects` line back to `/* /index.html 200` and redeploy — service restored. The canonical problem itself is still unfixed.
**Note for next time:**
- **Never point a `_redirects` 200-rewrite at a path ending in `.html` on Cloudflare Pages.** Use an extensionless path or a directory index (`/shell/`).
- **Always deploy infrastructure/routing changes to a preview branch first** (`wrangler pages deploy dist --branch=preview`) and check that `/` still returns 200 before touching production. A `_redirects` change can take the entire site down, unlike a code change.
- Verifying with `curl`/HttpClient: .NET `HttpClient` on PS 5.1 does **not** auto-follow 308, and it will look like a 0-byte response. Check the `Location` header before concluding a page is broken. Cloudflare Pages 308s every prerendered route to its trailing-slash form — that one is normal.
- The simplest safe fix for the canonical issue is to drop `'/'` from `STATIC_ROUTES` in `scripts/prerender.js`, so `index.html` stays the pristine shell. Costs the homepage its prerendered HTML, but needs no new Pages routing behaviour.
