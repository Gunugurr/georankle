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
      title={
        assignedCountry
          ? `${category.label} — ${assignedCountry.name}`
          : category.description
      }
    >
      <span className="category-emoji">{category.emoji}</span>
      <span className="category-label">{category.label}</span>
      {assignedCountry && (
        <span className="category-result">
          <FlagEmoji code={assignedCountry.code} size={24} />
          <span className="category-result-rank">#{assignedCountry.rank}</span>
        </span>
      )}
    </button>
  );
}
