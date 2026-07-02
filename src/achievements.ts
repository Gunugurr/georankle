import type { GameState } from './game/gameLogic';
import type { FreeGameEntry, DailyGameEntry } from './storage';

export const ACHIEVEMENT_IDS = [
  'first-game',
  'first-s',
  'perfect-game',
  'streak-3',
  'streak-7',
  'streak-30',
  'evil-a',
  'europe-s',
  'games-10',
  'games-50',
  'all-modes',
] as const;

export type AchievementId = (typeof ACHIEVEMENT_IDS)[number];

export const ACHIEVEMENT_EMOJI: Record<AchievementId, string> = {
  'first-game': '🐣',
  'first-s': '🌟',
  'perfect-game': '💯',
  'streak-3': '🔥',
  'streak-7': '🚒',
  'streak-30': '🌋',
  'evil-a': '😈',
  'europe-s': '🗺️',
  'games-10': '🎮',
  'games-50': '🏅',
  'all-modes': '🧭',
};

export interface AchievementContext {
  /** The game that just finished. */
  state: GameState;
  grade: string;
  /** Histories AFTER saving the finished game. */
  freeHistory: FreeGameEntry[];
  dailyHistory: Record<string, DailyGameEntry>;
  currentStreak: number;
  unlocked: Record<string, string>;
}

/** Returns achievement ids newly earned by the finished game (not yet unlocked). */
export function checkAchievements(ctx: AchievementContext): AchievementId[] {
  const out: AchievementId[] = [];
  const add = (id: AchievementId, cond: boolean) => {
    if (cond && !(id in ctx.unlocked)) out.push(id);
  };

  const dailyCount = Object.keys(ctx.dailyHistory).length;
  const totalGames = ctx.freeHistory.length + dailyCount;

  add('first-game', totalGames >= 1);
  add('first-s', ctx.grade === 'S');
  add(
    'perfect-game',
    ctx.state.maxAchievableScore > 0 && ctx.state.totalScore >= ctx.state.maxAchievableScore,
  );
  add('streak-3', ctx.currentStreak >= 3);
  add('streak-7', ctx.currentStreak >= 7);
  add('streak-30', ctx.currentStreak >= 30);
  add('evil-a', ctx.state.mode === 'evil' && (ctx.grade === 'A' || ctx.grade === 'S'));
  add('europe-s', ctx.state.mode === 'europe' && ctx.grade === 'S');
  add('games-10', totalGames >= 10);
  add('games-50', totalGames >= 50);

  const modes = new Set<string>(ctx.freeHistory.map(e => e.mode ?? 'free'));
  if (dailyCount > 0) modes.add('daily');
  add('all-modes', modes.size >= 4);

  return out;
}
