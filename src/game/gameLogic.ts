import type { Country } from '../data/countries';
import type { Category } from '../data/categories';

export interface RoundResult {
  country: Country;
  chosenCategory: Category;
  rank: number;
  score: number;
  bestCategory: Category;
  bestPossibleRank: number;
  bestPossibleScore: number;
}

export type GameMode = 'daily' | 'free' | 'europe' | 'evil';

export interface GameState {
  mode: GameMode;
  /** PRNG seed that generated this game; lets duel links replay the exact same game. */
  seed: number;
  /** Calendar key ("YYYY-M-D") this daily game belongs to; null for free mode. */
  dailyDateKey: string | null;
  countries: Country[];
  gameCategories: Category[]; // the 8 picked for this game (fixed order)
  availableCategories: Category[];
  usedCategories: Category[];
  currentRound: number;
  rounds: RoundResult[];
  totalScore: number;
  finished: boolean;
  maxAchievableScore: number;
  /** Fixed optimal category assignment, one per country (parallel to `countries`). */
  optimalAssignment: Category[];
  /** Number of ranked countries the ranks are relative to (195 world, pool size for Europe). */
  rankScale: number;
}

/** Seed-based pseudo-random number generator (mulberry32) */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Daily seed: same game for everyone on the same calendar day */
function dailySeed(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

export function dailyDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function tierOf(c: Country): 'a' | 'b' | 'c' {
  const top30 = Object.values(c.stats).filter(r => r <= 30).length;
  return top30 >= 5 ? 'a' : top30 >= 1 ? 'b' : 'c';
}

/** 4 strong + 3 mid + 1 weak: every hand stays playable, tiny countries stay rare. */
function pickGameCountries(all: Country[], rand: () => number): Country[] {
  const pools = { a: [] as Country[], b: [] as Country[], c: [] as Country[] };
  for (const c of all) pools[tierOf(c)].push(c);
  const picked = [
    ...shuffle(pools.a, rand).slice(0, 4),
    ...shuffle(pools.b, rand).slice(0, 3),
    ...shuffle(pools.c, rand).slice(0, 1),
  ];
  if (picked.length < 8) {
    const chosen = new Set(picked.map(c => c.code));
    picked.push(...shuffle(all.filter(c => !chosen.has(c.code)), rand).slice(0, 8 - picked.length));
  }
  return shuffle(picked, rand);
}

export function createGame(
  mode: GameMode,
  allCountries: Country[],
  allCategories: Category[],
  dailyDate: Date = new Date(),
  forcedSeed?: number,
): GameState {
  const seed =
    forcedSeed ?? (mode === 'daily' ? dailySeed(dailyDate) : Math.floor(Math.random() * 1e9));
  const rand = mulberry32(seed);
  const rankScale = allCountries.length;
  const countries = pickGameCountries(allCountries, rand);
  const categories = shuffle(allCategories, rand).slice(0, 8);
  const optimal = computeOptimalAssignment(countries, categories, mode === 'evil', rankScale);

  return {
    mode,
    seed,
    dailyDateKey: mode === 'daily' ? dailyDateKey(dailyDate) : null,
    countries,
    gameCategories: categories,
    availableCategories: categories,
    usedCategories: [],
    currentRound: 0,
    rounds: [],
    totalScore: 0,
    finished: false,
    maxAchievableScore: optimal.score,
    optimalAssignment: optimal.categories,
    rankScale,
  };
}

/**
 * Best possible total if the player assigned categories to countries optimally,
 * plus the one-to-one assignment (country index -> category) that achieves it.
 * In `reverse` mode, the worst-ranked category per country scores highest instead.
 * Brute-force over all permutations (8! = 40320 — fast enough).
 */
export function computeOptimalAssignment(
  countries: Country[],
  categories: Category[],
  reverse = false,
  rankScale = WORLD_COUNTRIES,
): { score: number; categories: Category[] } {
  const n = countries.length;
  if (n === 0) return { score: 0, categories: [] };
  const cats = [...categories];
  let best = 0;
  let bestAssignment = [...cats];

  const permute = (start: number) => {
    if (start === n) {
      let sum = 0;
      for (let i = 0; i < n; i++) {
        sum += rankToScore(countries[i]!.stats[cats[i]!.id], reverse, rankScale);
      }
      if (sum > best) {
        best = sum;
        bestAssignment = [...cats];
      }
      return;
    }
    for (let i = start; i < n; i++) {
      [cats[start], cats[i]] = [cats[i]!, cats[start]!];
      permute(start + 1);
      [cats[start], cats[i]] = [cats[i]!, cats[start]!];
    }
  };

  permute(0);
  return { score: best, categories: bestAssignment };
}

const WORLD_COUNTRIES = 195;

/** In `reverse` mode, the worst rank (closest to `total`) scores highest. */
export function rankToScore(rank: number, reverse = false, total = WORLD_COUNTRIES): number {
  if (rank > total) return 0;
  const effectiveRank = reverse ? total - rank + 1 : rank;
  const raw = (total - effectiveRank + 1) / total * 100;
  return Math.round(raw);
}

export function playRound(state: GameState, chosenCategory: Category): GameState {
  const country = state.countries[state.currentRound]!;
  const reverse = state.mode === 'evil';
  const rank = country.stats[chosenCategory.id];
  const score = rankToScore(rank, reverse, state.rankScale);
  const bestCat = state.optimalAssignment[state.currentRound]!;
  const bestRank = country.stats[bestCat.id];
  const bestScore = rankToScore(bestRank, reverse, state.rankScale);

  const round: RoundResult = {
    country,
    chosenCategory,
    rank,
    score,
    bestCategory: bestCat,
    bestPossibleRank: bestRank,
    bestPossibleScore: bestScore,
  };

  const newRound = state.currentRound + 1;
  const finished = newRound >= state.countries.length;

  return {
    ...state,
    availableCategories: state.availableCategories.filter(c => c.id !== chosenCategory.id),
    usedCategories: [...state.usedCategories, chosenCategory],
    currentRound: newRound,
    rounds: [...state.rounds, round],
    totalScore: state.totalScore + score,
    finished,
  };
}

export function maxPossibleScore(state: GameState): number {
  return state.maxAchievableScore;
}

export function grade(score: number, max: number): string {
  if (max === 0) return 'D';
  const pct = score / max;
  if (pct >= 0.9) return 'S';
  if (pct >= 0.75) return 'A';
  if (pct >= 0.55) return 'B';
  if (pct >= 0.35) return 'C';
  return 'D';
}
