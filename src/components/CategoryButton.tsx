import type { Category } from '../data/categories';
import FlagEmoji from './FlagEmoji';

interface AssignedCountry {
  code: string;
  name: string;
  rank: number;
  score: number;
}

interface Props {
  category: Category;
  status: 'available' | 'used' | 'revealed';
  onClick: () => void;
  assignedCountry?: AssignedCountry;
}

export default function CategoryButton({ category, status, onClick, assignedCountry }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={status !== 'available'}
      className={`category-btn category-btn--${status}`}
      aria-label={category.label}
      title={category.description}
    >
      <span className="category-emoji">{category.emoji}</span>
      <span className="category-label">{category.label}</span>
      {assignedCountry && (
        <span className="category-result">
          <FlagEmoji code={assignedCountry.code} size={16} />
          <span className="category-result-name">{assignedCountry.name}</span>
          <span className="category-result-rank">#{assignedCountry.rank} · {assignedCountry.score}pt</span>
        </span>
      )}
    </button>
  );
}
