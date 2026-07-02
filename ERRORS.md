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
