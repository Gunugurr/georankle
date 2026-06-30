import type { FreeGameEntry } from '../storage';
import { freeStats } from '../storage';

interface Props {
  entries: FreeGameEntry[];
}

export default function FreeStatsPanel({ entries }: Props) {
  const stats = freeStats(entries);

  return (
    <div className="stats-panel">
      <div className="panel-header">🎲 Free Play Stats</div>
      {stats.count === 0 ? (
        <div className="stats-empty">No free games played yet</div>
      ) : (
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{stats.count}</span>
            <span className="stat-label">Played</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.avg}</span>
            <span className="stat-label">Avg</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.best}</span>
            <span className="stat-label">Best</span>
          </div>
        </div>
      )}
    </div>
  );
}
