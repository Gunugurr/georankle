import { useState } from 'react';
import type { DailyGameEntry } from '../storage';

interface Props {
  history: Record<string, DailyGameEntry>;
  onClose: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function DailyCalendar({ history, onClose }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const startOffset = (firstDay + 6) % 7;
  const totalCells = startOffset + daysInMonth;
  const trailingEmpty = (7 - (totalCells % 7)) % 7;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  for (let i = 0; i < trailingEmpty; i++) cells.push(null);

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };
  const goNext = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const atFuture =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth >= today.getMonth());

  return (
    <div className="calendar-panel">
      <div className="calendar-header-row">
        <span className="calendar-section-title">📅 Daily History</span>
        <button
          className="calendar-close"
          onClick={onClose}
          aria-label="Close calendar"
        >
          ✕
        </button>
      </div>
      <div className="calendar-top">
        <button className="calendar-nav" onClick={goPrev} aria-label="Previous month">‹</button>
        <span className="calendar-title">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button
          className="calendar-nav"
          onClick={goNext}
          disabled={atFuture}
          aria-label="Next month"
        >›</button>
      </div>
      <div className="calendar-weekdays">
        <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
      </div>
      <div className="calendar-grid">
        {cells.map((d, i) => {
          if (d === null) {
            return <div key={i} className="calendar-cell calendar-cell--empty" />;
          }
          const key = `${viewYear}-${viewMonth + 1}-${d}`;
          const entry = history[key];
          const isToday =
            viewYear === today.getFullYear() &&
            viewMonth === today.getMonth() &&
            d === today.getDate();
          const cls = [
            'calendar-cell',
            entry && 'calendar-cell--played',
            isToday && 'calendar-cell--today',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <div
              key={i}
              className={cls}
              title={entry ? `${entry.totalScore} / ${entry.maxScore} (${entry.grade})` : undefined}
            >
              <span className="calendar-day">{d}</span>
              {entry && <span className="calendar-grade">{entry.grade}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
