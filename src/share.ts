import type { GameState } from './game/gameLogic';
import { maxPossibleScore, grade } from './game/gameLogic';
import { STRINGS } from './i18n';
import type { Language } from './i18n';

function roundEmoji(score: number, bestScore: number, optimal: boolean): string {
  if (optimal || score >= bestScore || bestScore === 0) return '🟩';
  return score / bestScore >= 0.7 ? '🟨' : '🟥';
}

export function buildShareText(state: GameState, lang: Language, streak: number): string {
  const s = STRINGS[lang];
  const max = maxPossibleScore(state);
  const g = grade(state.totalScore, max);
  const isDaily = state.mode === 'daily';

  let header: string;
  if (isDaily && state.dailyDateKey) {
    const [y, m, d] = state.dailyDateKey.split('-').map(Number);
    const date = new Date(y!, m! - 1, d!).toLocaleDateString(lang, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    header = `GeoRankle ${date}`;
  } else {
    const label =
      state.mode === 'europe'
        ? `🗺️ ${s.europeModeTitle}`
        : state.mode === 'evil'
        ? `😈 ${s.evilModeTitle}`
        : `🌍 ${s.worldModeTitle}`;
    header = `GeoRankle — ${label}`;
  }

  let scoreLine = `${g} · ${state.totalScore}/${max}`;
  if (isDaily && streak >= 2) scoreLine += ` · 🔥${streak}`;

  const emojis = state.rounds
    .map(r =>
      roundEmoji(r.score, r.bestPossibleScore, r.chosenCategory.id === r.bestCategory.id),
    )
    .join('');

  return `${header}\n${scoreLine}\n${emojis}`;
}
