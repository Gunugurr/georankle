import { useState } from 'react';
import type { GameState } from '../game/gameLogic';
import { maxPossibleScore, grade } from '../game/gameLogic';
import { buildShareText } from '../share';
import { ACHIEVEMENT_EMOJI } from '../achievements';
import type { AchievementId } from '../achievements';
import Confetti from './Confetti';
import FlagEmoji from './FlagEmoji';
import { useLang, useStrings, categoryLabel, countryName } from '../i18n';

interface Props {
  state: GameState;
  onPlayAgain: () => void;
  onSwitchMode: () => void;
  onMenu: () => void;
  dailyPlayed?: boolean;
  streak?: number;
  duelTarget?: number | null;
  newUnlocks?: AchievementId[];
}

async function shareOrCopy(text: string, onCopied: () => void): Promise<void> {
  if (navigator.share) {
    try {
      await navigator.share({ text });
    } catch {
      // user cancelled the share sheet
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    onCopied();
  } catch {
    // clipboard unavailable
  }
}

export default function ResultScreen({
  state,
  onPlayAgain,
  onSwitchMode,
  onMenu,
  dailyPlayed,
  streak,
  duelTarget,
  newUnlocks,
}: Props) {
  const s = useStrings();
  const lang = useLang();
  const [copied, setCopied] = useState(false);
  const [duelCopied, setDuelCopied] = useState(false);
  const max = maxPossibleScore(state);
  const g = grade(state.totalScore, max);

  const handleShare = () => {
    const text = buildShareText(state, lang, streak ?? 0);
    void shareOrCopy(text, () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDuelShare = () => {
    const link = `${window.location.origin}${window.location.pathname}?duel=${state.seed}&mode=${state.mode}&target=${state.totalScore}`;
    const text = `${s.duelShareText.replace('{score}', String(state.totalScore))}\n${link}`;
    void shareOrCopy(text, () => {
      setDuelCopied(true);
      setTimeout(() => setDuelCopied(false), 2000);
    });
  };

  const duelLine =
    duelTarget == null
      ? null
      : state.totalScore > duelTarget
      ? s.duelWin
      : state.totalScore < duelTarget
      ? s.duelLose
      : s.duelTie;
  const switchDisabled = state.mode !== 'daily' && dailyPlayed;
  const switchLabel =
    state.mode === 'daily'
      ? s.playFreeMode
      : dailyPlayed
      ? s.dailyDoneShort
      : s.dailyChallenge;

  return (
    <div className="result-screen">
      {g === 'S' && <Confetti />}
      {state.mode === 'evil' && <span className="evil-badge">{s.evilMode}</span>}
      <h2 className="result-title">{s.gameOver}</h2>
      <div className="result-grade">{g}</div>
      <div className="result-score">
        {state.totalScore} / {max}
      </div>

      {duelLine && duelTarget != null && (
        <div className="duel-result">
          <div className="duel-result-line">{duelLine}</div>
          <div className="duel-result-scores">
            {s.duelYou}: <strong>{state.totalScore}</strong> · {s.duelRival}:{' '}
            <strong>{duelTarget}</strong>
          </div>
        </div>
      )}

      {newUnlocks && newUnlocks.length > 0 && (
        <div className="achievement-toasts">
          {newUnlocks.map(id => (
            <div key={id} className="achievement-toast">
              <span className="achievement-toast-title">{s.achievementUnlocked}</span>
              <span className="achievement-toast-name">
                {ACHIEVEMENT_EMOJI[id]} {s.achievements[id][0]}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="result-review-title">{s.roundByRound}</div>
      <div className="result-rounds">
        {state.rounds.map((r, i) => {
          const isOptimal = r.chosenCategory.id === r.bestCategory.id;
          const delta = r.bestPossibleScore - r.score;
          const chosenLbl = categoryLabel(r.chosenCategory.id, lang);
          const bestLbl = categoryLabel(r.bestCategory.id, lang);
          return (
            <div
              key={i}
              className={`result-row${isOptimal ? ' result-row--optimal' : ''}`}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <FlagEmoji code={r.country.code} size={40} />
              <div className="result-row-body">
                <span className="result-row-name">{countryName(r.country.code, r.country.name, lang)}</span>
                <span className="result-row-yours">
                  <span className="result-row-mark">{isOptimal ? '✓' : '✗'}</span>
                  {r.chosenCategory.emoji} {chosenLbl}
                  <span className="result-row-meta">#{r.rank} · {r.score}pt</span>
                </span>
                {!isOptimal && (
                  <span className="result-row-best">
                    {s.best} {r.bestCategory.emoji} {bestLbl}
                    <span className="result-row-meta">#{r.bestPossibleRank} · {r.bestPossibleScore}pt</span>
                    <span className="result-row-delta">+{delta}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="result-actions">
        {state.mode === 'daily' ? (
          <button className="btn-primary" onClick={handleShare}>
            {copied ? s.copied : s.share}
          </button>
        ) : (
          <>
            <button className="btn-primary" onClick={onPlayAgain}>
              {s.playAgain}
            </button>
            <button className="btn-secondary" onClick={handleShare}>
              {copied ? s.copied : s.share}
            </button>
            <button className="btn-secondary" onClick={handleDuelShare}>
              {duelCopied ? s.copied : s.duelButton}
            </button>
          </>
        )}
        {state.mode !== 'evil' && (
          <button className="btn-secondary" onClick={onSwitchMode} disabled={switchDisabled}>
            {switchLabel}
          </button>
        )}
        <button className="btn-secondary" onClick={onMenu}>
          ← {s.menu}
        </button>
      </div>
    </div>
  );
}
