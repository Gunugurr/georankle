# 🌍 GeoRankle

A daily geography ranking trivia game. Match each country to the world stat it ranks best in — but every category can only be used once.

## How to play

- You're shown **8 countries** one by one
- For each country, pick the stat category (GDP, Population, Tourism, HDI…) where it ranks **highest in the world**
- Each of the **8 categories** can only be assigned to a single country
- The lower the country's world rank for your chosen stat, the more points you get
- **Max score: 800 pts** (rank #1 in every assignment)

## Scoring

Score is proportional to world rank across ~195 countries:

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

## Game modes

- **📅 Daily Challenge** — same 8 countries and 8 categories for everyone on the same calendar day. Playable once per day; your result is saved to a monthly calendar.
- **🎲 Free Play** — random pool each round. History tracks games played, average, and best score.

## Features

- 195 countries with 20 ranking categories each
- Real SVG flags via [flagcdn.com](https://flagcdn.com)
- Light & dark theme (toggle in top-right, persisted)
- Daily history calendar with per-day grade (S/A/B/C/D)
- Free play stats panel (count · avg · best)
- Slide-up country transitions
- Mobile-friendly layout, no scrolling needed on the play screen

## Tech

- **React 18** + **TypeScript** + **Vite**
- No backend — all state persisted to `localStorage`
- Pure CSS variables for theming, no framework

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

## Project structure

```
src/
├── App.tsx                       # screens, state, theme, history
├── main.tsx
├── index.css                     # all styles, light/dark vars
├── storage.ts                    # localStorage helpers (daily, free history)
├── components/
│   ├── FlagEmoji.tsx             # SVG flag wrapper (flagcdn.com)
│   ├── CategoryButton.tsx        # horizontal stat-category button
│   ├── DailyCalendar.tsx         # monthly grid with grade per day
│   ├── FreeStatsPanel.tsx        # count · avg · best
│   ├── ResultScreen.tsx          # post-game summary
│   └── RoundReveal.tsx           # (legacy, unused)
├── game/
│   └── gameLogic.ts              # createGame, playRound, rankToScore, grade
└── data/
    ├── countries.ts              # 195 countries × 20 stat ranks
    └── categories.ts              # 8 stat categories
```

## Data notes

Country ranks are approximate world rankings for each stat. A rank of `200` is used as a sentinel for "not applicable" (e.g. coastline for landlocked countries) and scores 0 points.
