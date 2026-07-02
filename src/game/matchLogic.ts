import type { Country } from '../data/countries';
import type { Category } from '../data/categories';
import type { GameState } from './gameLogic';
import { createGame, rankToScore } from './gameLogic';
import { COUNTRIES_UNIQUE } from '../data/countries';
import { CATEGORIES } from '../data/categories';

export const MATCH_LIVES = 3;

export interface MatchState {
  game: GameState;
  /** Country index → locked (correct) category. */
  placed: ReadonlyMap<number, Category>;
  lives: number;
  score: number;
  finished: boolean;
  won: boolean;
}

export function createMatch(): MatchState {
  const game = createGame('match', COUNTRIES_UNIQUE, CATEGORIES);
  return {
    game,
    placed: new Map(),
    lives: MATCH_LIVES,
    score: 0,
    finished: false,
    won: false,
  };
}

/** Best total over all permutations of `cats` onto `countries` (equal lengths). */
function bestPermTotal(countries: Country[], cats: Category[], rankScale: number): number {
  const n = countries.length;
  if (n === 0) return 0;
  const arr = [...cats];
  let best = 0;
  const permute = (start: number) => {
    if (start === n) {
      let sum = 0;
      for (let i = 0; i < n; i++) {
        sum += rankToScore(countries[i]!.stats[arr[i]!.id], false, rankScale);
      }
      if (sum > best) best = sum;
      return;
    }
    for (let i = start; i < n; i++) {
      [arr[start], arr[i]] = [arr[i]!, arr[start]!];
      permute(start + 1);
      [arr[start], arr[i]] = [arr[i]!, arr[start]!];
    }
  };
  permute(0);
  return best;
}

/** Best achievable total given the locked placements. */
function bestTotal(game: GameState, locked: ReadonlyMap<number, Category>): number {
  const lockedCatIds = new Set([...locked.values()].map(c => c.id));
  let base = 0;
  for (const [i, cat] of locked) {
    base += rankToScore(game.countries[i]!.stats[cat.id], false, game.rankScale);
  }
  const freeCountries = game.countries.filter((_, i) => !locked.has(i));
  const freeCats = game.gameCategories.filter(c => !lockedCatIds.has(c.id));
  return base + bestPermTotal(freeCountries, freeCats, game.rankScale);
}

/**
 * A placement is correct iff, with it locked in, the optimal total is still
 * reachable — so ties between equally good assignments are never punished.
 */
export function attemptPlacement(
  state: MatchState,
  countryIdx: number,
  cat: Category,
): { state: MatchState; correct: boolean } {
  if (state.finished || state.placed.has(countryIdx)) return { state, correct: false };
  if ([...state.placed.values()].some(c => c.id === cat.id)) return { state, correct: false };

  const withCandidate = new Map(state.placed);
  withCandidate.set(countryIdx, cat);
  const correct = bestTotal(state.game, withCandidate) === bestTotal(state.game, state.placed);

  if (correct) {
    const gained = rankToScore(
      state.game.countries[countryIdx]!.stats[cat.id],
      false,
      state.game.rankScale,
    );
    const done = withCandidate.size === state.game.countries.length;
    return {
      state: {
        ...state,
        placed: withCandidate,
        score: state.score + gained,
        finished: done,
        won: done,
      },
      correct: true,
    };
  }

  const lives = state.lives - 1;
  return {
    state: { ...state, lives, finished: lives === 0, won: false },
    correct: false,
  };
}

/** Optimal categories for the still-unplaced countries (for the lose-screen reveal). */
export function solveRemaining(state: MatchState): Map<number, Category> {
  const lockedCatIds = new Set([...state.placed.values()].map(c => c.id));
  const freeIdx = state.game.countries.map((_, i) => i).filter(i => !state.placed.has(i));
  const freeCats = state.game.gameCategories.filter(c => !lockedCatIds.has(c.id));
  const n = freeIdx.length;
  const arr = [...freeCats];
  let best = -1;
  let bestArr = [...arr];
  const permute = (start: number) => {
    if (start === n) {
      let sum = 0;
      for (let i = 0; i < n; i++) {
        sum += rankToScore(
          state.game.countries[freeIdx[i]!]!.stats[arr[i]!.id],
          false,
          state.game.rankScale,
        );
      }
      if (sum > best) {
        best = sum;
        bestArr = [...arr];
      }
      return;
    }
    for (let i = start; i < n; i++) {
      [arr[start], arr[i]] = [arr[i]!, arr[start]!];
      permute(start + 1);
      [arr[start], arr[i]] = [arr[i]!, arr[start]!];
    }
  };
  permute(0);
  const out = new Map<number, Category>();
  for (let i = 0; i < n; i++) out.set(freeIdx[i]!, bestArr[i]!);
  return out;
}
