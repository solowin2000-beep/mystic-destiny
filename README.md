# Mystic Destiny — BaZi calculator on true solar time

**Live site:** https://mystic-destiny.pages.dev

A static Astro site built around one idea: a BaZi (four pillars) chart has to be read from the moment
the sun stood over the birthplace, not from the clock on the wall. The calculator rebuilds that
moment and prints every step of the correction chain, so any result can be checked by hand.

## What it does that a plain calendar lookup does not
- **Historical timezone rules and daylight saving.** China observed UTC+09:00 summer time from 1986
  to 1991; the United States moved its DST dates in 2007; Arizona and Hawaii opt out. The offset used
  is the one that applied on the birth date, not the one that applies today.
- **Longitude.** A birthplace east or west of its zone's standard meridian is ahead or behind the
  clock by 4 minutes of solar time per degree.
- **The equation of time.** The sun runs from about 14.2 minutes behind in mid-February to about
  16.4 minutes ahead in early November, crossing zero four times a year.
- **Luck pillars.** With a gender entered, the calculator also draws the ten-year luck pillars
  (大运) with their annual (流年) and monthly (流月) pillars.

## Pages
| Path | What it is |
| --- | --- |
| `/` | Overview |
| `/bazi-calculator/` | The calculator, the correction chain and worked examples |
| `/true-solar-time/` | The three corrections, the formula and five worked examples |
| `/bazi-hour-pillar/` | The twelve two-hour branches and the late zi question |
| `/what-is-bazi/` | The four pillars, stems, branches, day master and five elements |

## Tech
Astro static build. No server, no runtime API calls: the calculation runs entirely in the browser.

| File | Role |
| --- | --- |
| `public/lib/lunar.js` | Bundled [lunar-javascript](https://github.com/6tail/lunar-javascript) (MIT) — solar terms, lunar calendar, four pillars |
| `public/lib/engine.js` | True solar time engine: timezone rule, longitude, equation of time |
| `public/lib/cities.js` | City coordinate and timezone database |
| `public/lib/luck.js` | Ten-year luck pillar wrapper |
| `src/site.config.mjs` | Single source of truth: domain, contact, per-page titles and descriptions |

## Build
```
npm install
npm run dev     # local preview
npm run build   # static output in dist/
```

Self-checks (no network needed):

```
node tools/regression.cjs   # 41 calculation and rendering checks
node tools/seo-check.cjs    # per-page title/description/structure checks
node tools/indexnow.cjs     # submit the sitemap URLs to Bing IndexNow
```

## Deploy
This repository is connected to the Cloudflare Pages project `mystic-destiny` at
https://mystic-destiny.pages.dev/. Pushing to `main` builds and deploys automatically
(build command `npm run build`, output directory `dist`).
The build output is plain static files, so the contents of `dist/` can also be uploaded by hand if needed.

## Data sources
- Timezone rules: IANA tz database, through the browser's `Intl` API
- Solar terms and the lunar calendar: lunar-javascript (MIT)
- Equation of time: the standard NOAA solar position formula
- City coordinates: compiled from public geographic data

## Licence
Site content and design are © Mystic Destiny. Bundled third-party libraries keep their own licences.
