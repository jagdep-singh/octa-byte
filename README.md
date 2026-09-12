# Real-Time Portfolio Dashboard

Next.js + TypeScript dashboard that tracks a 26-stock Indian equity portfolio across 6 sectors, fetching live prices from Yahoo Finance and fundamentals (P/E, EPS) from Google Finance, with market-hours-aware caching and fallback logic.



## What it does

- Fetches live CMP for all holdings via `yahoo-finance2`
- Scrapes P/E ratio and latest earnings (EPS) from Google Finance quote pages (Cheerio)
- Falls back to Yahoo's trailing P/E / EPS when Google doesn't return a value for a ticker, and shows `N/A` when neither source has it
- Computes Investment, Present Value, Gain/Loss, and Portfolio % per holding
- Groups holdings by sector with sector-level Investment / Present Value / Gain-Loss totals
- Refreshes prices every 15s while the market is open; serves a cached snapshot when closed
- Handles missing/failed API responses per-symbol without breaking the rest of the table

## Data sources 

| Data | Source | Fallback |
|---|---|---|
| CMP | Yahoo Finance `quote()` | — |
| P/E, EPS | Google Finance (scraped, Cheerio) | Yahoo trailing P/E / EPS (already fetched with CMP, no extra request) |
| Neither available | — | `N/A` |

Requests are batched (5 quotes / 6 fundamentals scrapes at a time) to avoid overloading upstream sources.

**Market hours:** Mon–Fri, 9:15 AM–3:30 PM IST (`lib/marketHours.ts`, via Luxon) but the calls start at 9AM to reduce delay 
- **Open:** quotes refetched every 15s; fundamentals refetched every 5 min (P/E/EPS don't move intraday, so this reduces scraping load without staleness).
- **Closed:** both caches served for up to 6 hours instead of refetching.

## Ticker mapping

A few tickers need exchange-specific overrides between Yahoo and Google:

```
Savani Financials  → Yahoo: 511577.BO
LTIMindtree        → Yahoo: LTM.NS   |  Google: LTM:NSE
```

Handled in `lib/symbols.ts` (Yahoo overrides) and `lib/googlefinance.ts` (Google overrides).

## API's

```
/api/portfolio     → static holdings, grouped by sector, with Investment/Portfolio% precomputed
/api/quotes        → Yahoo Finance: CMP + trailingPE/EPS sidecar
/api/fundamentals  → Google Finance scrape (batched, closed-hours cache)
```

The client merges `/api/portfolio` + `/api/quotes` + `/api/fundamentals` into the final table data on each poll.

## Error handling

- Each quote/fundamentals fetch is wrapped in try/catch per symbol — one failing ticker doesn't block the rest
- Failed fetches return `null`/`error` fields instead of throwing, so stale/partial data is still shown with a retry banner in the UI
- A React error boundary catches render-time crashes in the table

## Caching

In-memory, TTL-based (`lib/cache.ts`). No Redis/DB — resets on server restart. Two instances: 15s TTL for quotes, 5min TTL for fundamentals, both extended to 6h when the market is closed.

## Setup

Requires Node.js 20.9+.

```bash
npm install
npm run dev      # http://localhost:3000
```

Production:
```bash
npm run build
npm start
```

Checks:
```bash
npm run lint
npx tsc --noEmit
```

No API keys, `.env`, or database required — all data is fetched live via scraping/unofficial libraries.

## Limitations

- Google Finance scraping depends on current DOM class names; may break if Google changes markup
- Cache is in-memory only, not persisted across restarts
- No automated tests yet — `isMarketOpen`, ticker mapping, and number parsing (all pure functions in `lib/`) are the priority candidates
- Post-close prices are frozen snapshots, not real end-of-day settlement prices

## Project structure

```
app/
  page.tsx                    
  api/quotes/route.ts         
  api/fundamentals/route.ts   
  api/portfolio/route.ts      
lib/
  data/holdings.ts            # portfolio data 
  symbols.ts                  # Yahoo ticker overrides
  googlefinance.ts            # scraper + Google ticker 
  marketHours.ts              # IST market hours + cache TTLs
  cache.ts                    # in-memory TTL cache
  types.ts                    
components/                   
```
