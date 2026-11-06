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
| `foods.js` | food logger: AI models, deficit limits, AI prompt, quick-add food list |

`tools/generate-weeks.mjs` produced the week files once; running `npm run weeks` regenerates (and overwrites) them.

## Safety
General guidance for healthy teenagers, not medical advice. Stop anything that causes sharp or joint pain.

## Food logger
Describe a meal (or add a photo) and Claude estimates calories and macros. It needs your own Claude API key (Food tab → Targets & AI). The key is kept only in this browser and is not part of the JSON export. Without a key you can still log from the built-in Indian food list or by hand.
