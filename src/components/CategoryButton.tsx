import type { Category } from '../data/categories';
import FlagEmoji from './FlagEmoji';
import { useLang, categoryLabel, categoryDescription } from '../i18n';

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
  const lang = useLang();
  const label = categoryLabel(category.id, lang);
  const description = categoryDescription(category.id, lang);
  return (
    <button
      onClick={onClick}
      disabled={status !== 'available'}
      className={`category-btn category-btn--${status}`}
      aria-label={label}
      title={
        assignedCountry
          ? `${label} — ${assignedCountry.name}`
          : description
      }
    >
      <span className="category-emoji">{category.emoji}</span>
      <span className="category-label">{label}</span>
      {assignedCountry && (
        <span className="category-result">
          <FlagEmoji code={assignedCountry.code} size={24} />
          <span className="category-result-rank">#{assignedCountry.rank}</span>
        </span>
      )}
    </button>
  );
}
