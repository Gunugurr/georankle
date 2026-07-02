import { Fragment } from 'react';
import type { ReactNode } from 'react';
import type { FreeGameEntry, UnlimitedMode } from '../storage';
import { freeStats, entriesForMode } from '../storage';
import { useStrings } from '../i18n';
import FlagEmoji from './FlagEmoji';

interface Props {
  entries: FreeGameEntry[];
}

export default function FreeStatsPanel({ entries }: Props) {
  const s = useStrings();
  const groups: { mode: UnlimitedMode; label: ReactNode }[] = [
    { mode: 'free', label: s.statsWorld },
    {
      mode: 'europe',
      label: (
        <>
          <FlagEmoji code="EU" size={18} /> {s.statsEurope}
        </>
      ),
    },
    { mode: 'evil', label: s.statsEvil },
    { mode: 'match', label: s.statsMatch },
  ];
  const rows = groups
    .map(g => ({ ...g, stats: freeStats(entriesForMode(entries, g.mode)) }))
    .filter(r => r.stats.count > 0);

  return (
    <div className="stats-panel">
      <div className="panel-header">{s.freeStats}</div>
      {rows.length === 0 ? (
        <div className="stats-empty">{s.noFreeGames}</div>
      ) : (
        <div className="stats-table">
          <span />
          <span className="stats-col-header">{s.played}</span>
          <span className="stats-col-header">{s.avg}</span>
          <span className="stats-col-header">{s.bestStat}</span>
          {rows.map(r => (
            <Fragment key={r.mode}>
              <span className="stats-row-label">{r.label}</span>
              <span className="stats-cell">{r.stats.count}</span>
              <span className="stats-cell">{r.stats.avg}</span>
              <span className="stats-cell">{r.stats.best}</span>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
