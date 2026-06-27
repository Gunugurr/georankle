import type { GameState } from '../game/gameLogic';
import { maxPossibleScore } from '../game/gameLogic';
import FlagEmoji from './FlagEmoji';

interface Props {
  state: GameState;
  onPlayAgain: () => void;
  onSwitchMode: () => void;
}

function grade(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.9) return 'S';
  if (pct >= 0.75) return 'A';
  if (pct >= 0.55) return 'B';
  if (pct >= 0.35) return 'C';
  return 'D';
}

export default function ResultScreen({ state, onPlayAgain, onSwitchMode }: Props) {
  const max = maxPossibleScore(state);
  const g = grade(state.totalScore, max);

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
            <FlagEmoji code={r.country.code} size={28} />
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
        <button className="btn-secondary" onClick={onSwitchMode}>
          {state.mode === 'daily' ? 'Play Free Mode' : 'Daily Challenge'}
        </button>
      </div>
    </div>
  );
}
