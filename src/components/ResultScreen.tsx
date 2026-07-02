import type { GameState } from '../game/gameLogic';
import { maxPossibleScore, grade } from '../game/gameLogic';
import FlagEmoji from './FlagEmoji';
import { useLang, useStrings, categoryLabel, countryName } from '../i18n';

interface Props {
  state: GameState;
  onPlayAgain: () => void;
  onSwitchMode: () => void;
  onMenu: () => void;
  dailyPlayed?: boolean;
}

export default function ResultScreen({ state, onPlayAgain, onSwitchMode, onMenu, dailyPlayed }: Props) {
  const s = useStrings();
  const lang = useLang();
  const max = maxPossibleScore(state);
  const g = grade(state.totalScore, max);
  const switchDisabled = state.mode !== 'daily' && dailyPlayed;
  const switchLabel =
    state.mode === 'daily'
      ? s.playFreeMode
      : dailyPlayed
      ? s.dailyDoneShort
      : s.dailyChallenge;

  return (
    <div className="result-screen">
      {state.mode === 'evil' && <span className="evil-badge">{s.evilMode}</span>}
      <h2 className="result-title">{s.gameOver}</h2>
      <div className="result-grade">{g}</div>
      <div className="result-score">
        {state.totalScore} / {max}
      </div>

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
        {state.mode !== 'daily' && (
          <button className="btn-primary" onClick={onPlayAgain}>
            {s.playAgain}
          </button>
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
