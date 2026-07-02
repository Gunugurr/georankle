import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import type { Category } from '../data/categories';
import { createMatch, attemptPlacement, solveRemaining, MATCH_LIVES } from '../game/matchLogic';
import type { MatchState } from '../game/matchLogic';
import { rankToScore } from '../game/gameLogic';
import FlagEmoji from './FlagEmoji';
import { useLang, useStrings, countryName, categoryLabel } from '../i18n';
import { ACHIEVEMENT_EMOJI } from '../achievements';
import type { AchievementId } from '../achievements';

interface Props {
  onFinished: (state: MatchState) => void;
  onPlayAgain: () => void;
  onMenu: () => void;
  newUnlocks?: AchievementId[];
}

interface DragInfo {
  idx: number;
  startX: number;
  startY: number;
  moved: boolean;
}

const DRAG_THRESHOLD = 8;

function catUnderPoint(x: number, y: number): string | null {
  const el = document.elementFromPoint(x, y);
  const cell = el?.closest('[data-cat-id]');
  return cell ? cell.getAttribute('data-cat-id') : null;
}

export default function MatchGame({ onFinished, onPlayAgain, onMenu, newUnlocks }: Props) {
  const lang = useLang();
  const s = useStrings();
  const [match, setMatch] = useState<MatchState>(() => createMatch());
  const [selected, setSelected] = useState<number | null>(null);
  const [ghost, setGhost] = useState<{ idx: number; x: number; y: number } | null>(null);
  const [hoverCat, setHoverCat] = useState<string | null>(null);
  const [wrongCat, setWrongCat] = useState<string | null>(null);
  const dragRef = useRef<DragInfo | null>(null);
  const notifiedRef = useRef(false);

  const { game } = match;

  useEffect(() => {
    if (match.finished && !notifiedRef.current) {
      notifiedRef.current = true;
      onFinished(match);
    }
  }, [match, onFinished]);

  const place = useCallback(
    (idx: number, cat: Category) => {
      setSelected(null);
      setMatch(prev => {
        const { state: next, correct } = attemptPlacement(prev, idx, cat);
        if (next !== prev && !correct) {
          setWrongCat(cat.id);
          setTimeout(() => setWrongCat(null), 500);
        }
        return next;
      });
    },
    [],
  );

  const handlePointerDown = (e: React.PointerEvent, idx: number) => {
    if (match.finished) return;
    dragRef.current = { idx, startX: e.clientX, startY: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    if (!d.moved) {
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      if (dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) return;
      d.moved = true;
    }
    setGhost({ idx: d.idx, x: e.clientX, y: e.clientY });
    setHoverCat(catUnderPoint(e.clientX, e.clientY));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    dragRef.current = null;
    setGhost(null);
    setHoverCat(null);
    if (!d) return;
    if (!d.moved) {
      setSelected(sel => (sel === d.idx ? null : d.idx));
      return;
    }
    const catId = catUnderPoint(e.clientX, e.clientY);
    const cat = game.gameCategories.find(c => c.id === catId);
    if (cat) place(d.idx, cat);
  };

  const handleCellClick = (cat: Category) => {
    if (selected !== null) place(selected, cat);
  };

  const lockedByCat = useMemo(() => {
    const map = new Map<string, number>();
    for (const [i, cat] of match.placed) map.set(cat.id, i);
    return map;
  }, [match.placed]);

  const solution = useMemo(
    () => (match.finished && !match.won ? solveRemaining(match) : null),
    [match],
  );

  const trayCountries = game.countries
    .map((c, i) => ({ country: c, idx: i }))
    .filter(({ idx }) => !match.placed.has(idx));

  const hearts = '❤️'.repeat(match.lives) + '🖤'.repeat(MATCH_LIVES - match.lives);

  return (
    <div className="game-screen match-screen">
      <div className="game-header">
        <button className="btn-back" onClick={onMenu}>
          <span className="btn-back-arrow">←</span>
          <span>{s.menu}</span>
        </button>
        <span className="match-lives" aria-label={`${s.livesLabel}: ${match.lives}`}>
          {hearts}
        </span>
      </div>

      <div className="game-score-card">
        <span className="game-score-label">{s.score}</span>
        <span className="game-score-value">{match.score}</span>
      </div>

      {!match.finished && trayCountries.length > 0 && (
        <>
          <p className="match-hint">{s.matchHint}</p>
          <div className="match-tray">
            {trayCountries.map(({ country, idx }) => (
              <button
                key={country.code}
                className={`match-chip${selected === idx ? ' match-chip--selected' : ''}${
                  ghost?.idx === idx ? ' match-chip--dragging' : ''
                }`}
                onPointerDown={e => handlePointerDown(e, idx)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={() => {
                  dragRef.current = null;
                  setGhost(null);
                  setHoverCat(null);
                }}
              >
                <FlagEmoji code={country.code} size={54} />
                <span className="match-chip-name">
                  {countryName(country.code, country.name, lang)}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {match.finished && (
        <div className="match-end">
          <h2 className="match-end-title">{match.won ? s.matchWin : s.matchLose}</h2>
          <p className="match-end-score">
            {s.score}: <strong>{match.score}</strong> / {game.maxAchievableScore}
          </p>
          {!match.won && <p className="match-end-solution-label">{s.matchSolution} 👇</p>}
          {newUnlocks && newUnlocks.length > 0 && (
            <div className="achievement-toasts">
              {newUnlocks.map(id => (
                <div key={id} className="achievement-toast">
                  <span className="achievement-toast-title">{s.achievementUnlocked}</span>
                  <span className="achievement-toast-name">
                    {ACHIEVEMENT_EMOJI[id]} {s.achievements[id][0]}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="match-end-actions">
            <button className="btn-primary" onClick={onPlayAgain}>
              {s.playAgain}
            </button>
            <button className="btn-secondary" onClick={onMenu}>
              {s.menu}
            </button>
          </div>
        </div>
      )}

      <div className="match-grid">
        {game.gameCategories.map(cat => {
          const lockedIdx = lockedByCat.get(cat.id);
          const solvedIdx = solution
            ? [...solution.entries()].find(([, c]) => c.id === cat.id)?.[0]
            : undefined;
          const shownIdx = lockedIdx ?? solvedIdx;
          const country = shownIdx !== undefined ? game.countries[shownIdx]! : null;
          const isLocked = lockedIdx !== undefined;
          const cls = [
            'match-cell',
            isLocked && 'match-cell--locked',
            solvedIdx !== undefined && !isLocked && 'match-cell--solution',
            wrongCat === cat.id && 'match-cell--wrong',
            hoverCat === cat.id && !isLocked && 'match-cell--hover',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <div
              key={cat.id}
              className={cls}
              data-cat-id={isLocked ? undefined : cat.id}
              onClick={() => !isLocked && handleCellClick(cat)}
            >
              <span className="match-cell-cat">
                {cat.emoji} {categoryLabel(cat.id, lang)}
              </span>
              {country && (
                <span className="match-cell-answer">
                  <FlagEmoji code={country.code} size={32} />
                  <span className="match-cell-country">
                    {countryName(country.code, country.name, lang)}
                  </span>
                  <span className="match-cell-rank">#{country.stats[cat.id]}</span>
                  <span className="match-cell-pts">
                    +{rankToScore(country.stats[cat.id], false, game.rankScale)}
                  </span>
                </span>
              )}
            </div>
          );
        })}
      </div>

      {ghost && (
        <div className="match-ghost" style={{ left: ghost.x, top: ghost.y }}>
          <FlagEmoji code={game.countries[ghost.idx]!.code} size={48} />
        </div>
      )}
    </div>
  );
}
