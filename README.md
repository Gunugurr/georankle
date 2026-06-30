# 🌍 GeoRankle

A daily geography ranking trivia game. Match each country to the world stat it ranks best in — but every category can only be used once.

**Live:** https://geotrivia-iota.vercel.app

## How to play

- You're shown **8 countries** one by one
- For each country, pick the stat category (GDP, Population, Tourism, HDI…) where it ranks **highest in the world**
- 8 categories are drawn per game; each can only be used once
- The lower the country's world rank for your chosen stat, the more points you get
- **Max score depends on the 8 countries you draw** — computed as the best possible assignment of categories to countries (see below)

## Scoring

Per-pick score is proportional to world rank across ~195 countries:

```
score = round( (195 − rank + 1) / 195 × 100 )
```

| World Rank | Points |
| ---------- | -----: |
| 1          |    100 |
| 10         |     95 |
| 50         |     75 |
| 100        |     49 |
| 150        |     24 |
| 195        |      1 |

Ranks above 195 (sentinel value `200`, e.g. coastline for a landlocked country) score 0.

### Achievable max

Because the 8 countries you're dealt may not be world #1 in any of the 8 categories you get, the absolute ceiling of 800 is rarely reachable. The game computes the **achievable maximum** by brute-forcing all 8! = 40,320 country→category assignments and picking the highest total. Your end-of-game grade (S/A/B/C/D) is based on `yourScore / achievableMax`.

## Game modes

- **📅 Daily Challenge** — same 8 countries and 8 categories for everyone on the same calendar day. Playable once per day; your result is saved to a monthly calendar.
- **🎲 Free Play** — random pool each round. History tracks games played, average, and best score.

## Features

- 195 countries × 20 ranking categories
- Real SVG flags via [flagcdn.com](https://flagcdn.com)
- English / Türkçe — auto-detected from browser, toggleable in the top-right
- Light & dark theme (toggle persisted to `localStorage`)
- Daily history calendar with per-day grade (S/A/B/C/D) and month navigation
- Free play stats panel: games played · average · best
- Round-by-round results: shows your pick **and** the optimal pick for each country, with a `+N` delta for missed points
- Slide-up animations on country change and round reveals
- Mobile-first layout — single-column categories on small screens
- Vercel Analytics integrated

## Tech

- **React 18** + **TypeScript** + **Vite 6**
- **@vercel/analytics** for page-view metrics
- No backend — all state persisted to `localStorage`
- Pure CSS variables for theming, no UI framework

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173 (or 5174 if 5173 is taken).

## Build

```bash
npm run build
npm run preview
```

## Deploy

The project is wired to Vercel; production deploys with:

```bash
vercel --prod
```

## Project structure

```
src/
├── App.tsx                       # screens, state, theme, lang, history
├── main.tsx                      # mounts <App /> and <Analytics />
├── index.css                     # all styles, light/dark vars, animations
├── i18n.ts                       # EN/TR strings, category labels, hooks
├── storage.ts                    # localStorage helpers (daily + free history)
├── vite-env.d.ts                 # vite/client type reference
├── components/
│   ├── FlagEmoji.tsx             # SVG flag wrapper (flagcdn.com)
│   ├── CategoryButton.tsx        # horizontal stat-category button
│   ├── DailyCalendar.tsx         # monthly grid with grade per day
│   ├── FreeStatsPanel.tsx        # played · avg · best
│   └── ResultScreen.tsx          # post-game summary with optimal picks
├── game/
│   └── gameLogic.ts              # createGame, playRound, rankToScore,
│                                 # grade, computeMaxAchievableScore
└── data/
    ├── countries.ts              # 195 countries × 20 stat ranks
    └── categories.ts              # 20 stat categories (8 drawn per game)
```

## Data notes

Country ranks are approximate world rankings for each stat. A rank of `200` is used as a sentinel for "not applicable" (e.g. coastline for landlocked countries, internet users for unrecognized states) and scores 0 points.
