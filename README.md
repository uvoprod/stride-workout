# Stride — 12-week fat-loss training app

A phone-first workout dashboard: Push / Pull / Legs + Jump plan, set logging with rest timer,
progressive-overload suggestions, weight trend, waist, strength and jump tracking, habits, journal,
badges, stretching routines, and 3D progress ring. Data lives in your browser (localStorage) with JSON export/import.

## Run locally
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```
Tip: add `?today=2026-12-01` to the URL to pretend it is another day (handy for previewing later weeks).

## Edit things (all in `src/config/`)
| File | What it controls |
|---|---|
| `theme.js` | colours, fonts, radius, brand name |
| `fonts.css` + `src/assets/fonts/` | bundled local fonts |
| `exercises.js` | exercise library: cues, swaps, starting-weight guesses |
| `weeks/week01.js … week12.js` | the full programme, week by week |
| `stretches.js` | warm-ups, cool-down stretches, rest-day mobility routine |
| `phases.js` | phase descriptions and RPE guide |
| `content.js` | quotes, journal prompts, habits, "ate too much" messages |
| `badges.js` | milestone badges |

`tools/generate-weeks.mjs` produced the week files once; running `npm run weeks` regenerates (and overwrites) them.

## Safety
General guidance for healthy teenagers, not medical advice. Stop anything that causes sharp or joint pain.
