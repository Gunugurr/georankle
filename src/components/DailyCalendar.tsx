import { useState } from 'react';
import type { DailyGameEntry } from '../storage';
import { useStrings } from '../i18n';

interface Props {
  history: Record<string, DailyGameEntry>;
  onClose: () => void;
  onPlayDate: (date: Date) => void;
}

const CATCH_UP_DAYS = 3;

export default function DailyCalendar({ history, onClose, onPlayDate }: Props) {
  const s = useStrings();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minPlayable = new Date(today);
  minPlayable.setDate(minPlayable.getDate() - CATCH_UP_DAYS);
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
        <span className="calendar-section-title">{s.dailyHistory}</span>
        <button
          className="calendar-close"
          onClick={onClose}
          aria-label={s.closeCalendar}
        >
          ✕
        </button>
      </div>
      <div className="calendar-top">
        <button className="calendar-nav" onClick={goPrev} aria-label={s.previousMonth}>‹</button>
        <span className="calendar-title">{s.months[viewMonth]} {viewYear}</span>
        <button
          className="calendar-nav"
          onClick={goNext}
          disabled={atFuture}
          aria-label={s.nextMonth}
        >›</button>
      </div>
      <div className="calendar-weekdays">
        {s.weekdays.map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="calendar-grid">
        {cells.map((d, i) => {
          if (d === null) {
            return <div key={i} className="calendar-cell calendar-cell--empty" />;
          }
          const key = `${viewYear}-${viewMonth + 1}-${d}`;
          const entry = history[key];
          const cellDate = new Date(viewYear, viewMonth, d);
          const isToday = cellDate.getTime() === today.getTime();
          const isPlayable = !entry && cellDate <= today && cellDate >= minPlayable;
          const cls = [
            'calendar-cell',
            entry && 'calendar-cell--played',
            isToday && 'calendar-cell--today',
            isPlayable && 'calendar-cell--playable',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <div
              key={i}
              className={cls}
              role={isPlayable ? 'button' : undefined}
              tabIndex={isPlayable ? 0 : undefined}
              onClick={isPlayable ? () => onPlayDate(cellDate) : undefined}
              onKeyDown={
                isPlayable
                  ? e => {
                      if (e.key === 'Enter' || e.key === ' ') onPlayDate(cellDate);
                    }
                  : undefined
              }
              title={
                entry
                  ? `${entry.totalScore} / ${entry.maxScore} (${entry.grade})`
                  : isPlayable
                  ? s.playThisDay
                  : undefined
              }
            >
              <span className="calendar-day">{d}</span>
              {entry && (
                <span className="calendar-grade">
                  {entry.grade} · {entry.totalScore}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
