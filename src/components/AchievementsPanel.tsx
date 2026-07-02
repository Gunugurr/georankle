import { ACHIEVEMENT_IDS, ACHIEVEMENT_EMOJI } from '../achievements';
import { useStrings } from '../i18n';

interface Props {
  unlocked: Record<string, string>;
}

export default function AchievementsPanel({ unlocked }: Props) {
  const s = useStrings();

  return (
    <div className="achievements-panel">
      {ACHIEVEMENT_IDS.map(id => {
        const isUnlocked = id in unlocked;
        const [name, desc] = s.achievements[id];
        return (
          <div
            key={id}
            className={`achievement${isUnlocked ? ' achievement--unlocked' : ''}`}
          >
            <span className="achievement-emoji">{isUnlocked ? ACHIEVEMENT_EMOJI[id] : '🔒'}</span>
            <span className="achievement-text">
              <span className="achievement-name">{name}</span>
              <span className="achievement-desc">{desc}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
