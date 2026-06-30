import type { RoundResult } from '../game/gameLogic';
import FlagEmoji from './FlagEmoji';

interface Props {
  result: RoundResult;
  onNext: () => void;
  isLast: boolean;
}

function scoreLabel(score: number): string {
  if (score === 100) return '🔥 Perfect!';
  if (score >= 80) return '⭐ Excellent!';
  if (score >= 60) return '👍 Good';
  if (score >= 40) return '😐 Okay';
  return '😔 Low';
}

export default function RoundReveal({ result, onNext, isLast }: Props) {
  const { country, chosenCategory, rank, score, bestPossibleRank, bestPossibleScore } = result;
  const isOptimal = score === bestPossibleScore;

  return (
    <div className="reveal-card">
      <div className="reveal-flag">
        <FlagEmoji code={country.code} size={72} />
        <span className="reveal-country">{country.name}</span>
      </div>

      <div className="reveal-chosen">
        <div className="reveal-label">You chose</div>
        <div className="reveal-category">
          {chosenCategory.emoji} {chosenCategory.label}
        </div>
        <div className="reveal-rank">
          World rank #{rank} → <strong>{score} pts</strong>
        </div>
      </div>

      {!isOptimal && (
        <div className="reveal-best">
          <div className="reveal-label">Best option was</div>
          <div className="reveal-category">
            {result.chosenCategory.emoji === result.chosenCategory.emoji
              ? ''
              : result.chosenCategory.emoji}{' '}
            {result.country.name}
          </div>
          <div className="reveal-rank">
            {result.bestPossibleRank < rank
              ? `Rank #${bestPossibleRank} → ${bestPossibleScore} pts`
              : 'You picked the best!'}
          </div>
        </div>
      )}

      {isOptimal && <div className="reveal-optimal"></div>}

      <button className="btn-primary" onClick={onNext}>
        {isLast ? 'See Results' : 'Next Country →'}
      </button>
    </div>
  );
}
