import type { Country } from '../data/countries';
import type { Category } from '../data/categories';

export interface RoundResult {
  country: Country;
  chosenCategory: Category;
  rank: number;
  score: number;
  bestPossibleRank: number;
  bestPossibleScore: number;
}

export interface GameState {
  mode: 'daily' | 'free';
  countries: Country[];
  gameCategories: Category[]; // the 8 picked for this game (fixed order)
  availableCategories: Category[];
  usedCategories: Category[];
  currentRound: number;
  rounds: RoundResult[];
  totalScore: number;
  finished: boolean;
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
function dailySeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

export function createGame(
  mode: 'daily' | 'free',
  allCountries: Country[],
  allCategories: Category[],
): GameState {
  const seed = mode === 'daily' ? dailySeed() : Math.floor(Math.random() * 1e9);
  const rand = mulberry32(seed);
  const countries = shuffle(allCountries, rand).slice(0, 8);
  const categories = shuffle(allCategories, rand).slice(0, 8);

  return {
    mode,
    countries,
    gameCategories: categories,
    availableCategories: categories,
    usedCategories: [],
    currentRound: 0,
    rounds: [],
    totalScore: 0,
    finished: false,
  };
}

const WORLD_COUNTRIES = 195;

export function rankToScore(rank: number): number {
  if (rank > WORLD_COUNTRIES) return 0;
  const raw = (WORLD_COUNTRIES - rank + 1) / WORLD_COUNTRIES * 100;
  return Math.round(raw);
}

export function getBestCategory(country: Country, categories: Category[]): Category {
  return categories.reduce((best, cat) => {
    const bestRank = country.stats[best.id];
    const catRank = country.stats[cat.id];
    return catRank < bestRank ? cat : best;
  });
}

export function playRound(state: GameState, chosenCategory: Category): GameState {
  const country = state.countries[state.currentRound]!;
  const rank = country.stats[chosenCategory.id];
  const score = rankToScore(rank);
  const bestCat = getBestCategory(country, state.availableCategories);
  const bestRank = country.stats[bestCat.id];
  const bestScore = rankToScore(bestRank);

  const round: RoundResult = {
    country,
    chosenCategory,
    rank,
    score,
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
  return state.countries.length * 100;
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
