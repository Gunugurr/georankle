import type { GameState } from '../game/gameLogic';
import { maxPossibleScore, grade } from '../game/gameLogic';
import FlagEmoji from './FlagEmoji';

interface Props {
  state: GameState;
  onPlayAgain: () => void;
  onSwitchMode: () => void;
  onMenu: () => void;
  dailyPlayed?: boolean;
}

export default function ResultScreen({ state, onPlayAgain, onSwitchMode, onMenu, dailyPlayed }: Props) {
  const max = maxPossibleScore(state);
  const g = grade(state.totalScore, max);
  const switchDisabled = state.mode === 'free' && dailyPlayed;
  const switchLabel =
    state.mode === 'daily'
      ? 'Play Free Mode'
      : dailyPlayed
      ? '✅ Daily Done'
      : 'Daily Challenge';

  return (
    <div className="result-screen">
      <h2 className="result-title">Game Over</h2>
      <div className="result-grade">{g}</div>
      <div className="result-score">
        {state.totalScore} / {max}
      </div>

      <div className="result-rounds">
        {state.rounds.map((r, i) => (
          <div key={i} className="result-row">
            <FlagEmoji code={r.country.code} size={48} />
            <span className="result-row-name">{r.country.name}</span>
            <span className="result-row-cat">
              {r.chosenCategory.emoji} {r.chosenCategory.label}
            </span>
            <span className="result-row-rank">#{r.rank}</span>
            <span className="result-row-score">{r.score}pt</span>
          </div>
        ))}
      </div>

      <div className="result-actions">
        {state.mode === 'free' && (
          <button className="btn-primary" onClick={onPlayAgain}>
            Play Again
          </button>
        )}
        <button className="btn-secondary" onClick={onSwitchMode} disabled={switchDisabled}>
          {switchLabel}
        </button>
        <button className="btn-secondary" onClick={onMenu}>
          ← Menu
        </button>
      </div>
    </div>
  );
}
