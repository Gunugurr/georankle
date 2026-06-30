import type { FreeGameEntry } from '../storage';
import { freeStats } from '../storage';
import { useStrings } from '../i18n';

interface Props {
  entries: FreeGameEntry[];
}

export default function FreeStatsPanel({ entries }: Props) {
  const s = useStrings();
  const stats = freeStats(entries);

  return (
    <div className="stats-panel">
      <div className="panel-header">{s.freeStats}</div>
      {stats.count === 0 ? (
        <div className="stats-empty">{s.noFreeGames}</div>
      ) : (
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{stats.count}</span>
            <span className="stat-label">{s.played}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.avg}</span>
            <span className="stat-label">{s.avg}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.best}</span>
            <span className="stat-label">{s.bestStat}</span>
          </div>
        </div>
      )}
    </div>
  );
}
