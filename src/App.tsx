import { useState, useCallback, useEffect } from 'react';
import { COUNTRIES_UNIQUE } from './data/countries';
import { CATEGORIES } from './data/categories';
import { createGame, playRound, maxPossibleScore, grade } from './game/gameLogic';
import type { GameState } from './game/gameLogic';
import type { Category } from './data/categories';
import FlagEmoji from './components/FlagEmoji';
import CategoryButton from './components/CategoryButton';
import ResultScreen from './components/ResultScreen';
import DailyCalendar from './components/DailyCalendar';
import FreeStatsPanel from './components/FreeStatsPanel';
import {
  loadFreeHistory,
  loadDailyHistory,
  saveFreeGame,
  saveDailyGame,
} from './storage';
import type { FreeGameEntry, DailyGameEntry } from './storage';

type Screen = 'menu' | 'playing' | 'results';
type Theme = 'dark' | 'light';

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [game, setGame] = useState<GameState | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    return localStorage.getItem('georankle-theme') === 'light' ? 'light' : 'dark';
  });
  const [freeHistory, setFreeHistory] = useState<FreeGameEntry[]>(() => loadFreeHistory());
  const [dailyHistory, setDailyHistory] = useState<Record<string, DailyGameEntry>>(() =>
    loadDailyHistory(),
  );
  const [calendarOpen, setCalendarOpen] = useState(false);

  const dailyPlayed = !!dailyHistory[todayKey()];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('georankle-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const startGame = useCallback((mode: 'daily' | 'free') => {
    const g = createGame(mode, COUNTRIES_UNIQUE, CATEGORIES);
    setGame(g);
    setScreen('playing');
  }, []);

  const handleCategoryPick = useCallback(
    (cat: Category) => {
      if (!game) return;
      const updated = playRound(game, cat);
      setGame(updated);
      if (updated.finished) {
        const max = maxPossibleScore(updated);
        const g = grade(updated.totalScore, max);
        if (updated.mode === 'daily') {
          const entry: DailyGameEntry = {
            dateKey: todayKey(),
            totalScore: updated.totalScore,
            maxScore: max,
            grade: g,
          };
          saveDailyGame(entry);
          setDailyHistory(prev => ({ ...prev, [entry.dateKey]: entry }));
        } else {
          const entry: FreeGameEntry = {
            date: new Date().toISOString(),
            totalScore: updated.totalScore,
            maxScore: max,
            grade: g,
          };
          saveFreeGame(entry);
          setFreeHistory(prev => [...prev, entry]);
        }
        setScreen('results');
      }
    },
    [game],
  );

  const handlePlayAgain = useCallback(() => startGame('free'), [startGame]);
  const handleSwitchMode = useCallback(() => {
    if (!game) return;
    if (game.mode === 'daily') {
      startGame('free');
    } else if (!dailyPlayed) {
      startGame('daily');
    } else {
      setScreen('menu');
    }
  }, [game, dailyPlayed, startGame]);

  const themeToggle = (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );

  if (screen === 'menu') {
    return (
      <div className="app">
        {themeToggle}
        <div className="menu-screen">
          <div className="menu-logo">🌍</div>
          <h1 className="menu-title">GeoRankle</h1>
          <p className="menu-subtitle">Match each country to its strongest world ranking stat</p>
          <div className="menu-actions">
            <div className="daily-row">
              <button
                className="btn-primary btn-large"
                onClick={() => startGame('daily')}
                disabled={dailyPlayed}
              >
                {dailyPlayed ? '✅ Today\'s Daily Done' : '📅 Daily Challenge'}
              </button>
              <button
                className={`calendar-toggle${calendarOpen ? ' calendar-toggle--active' : ''}`}
                onClick={() => setCalendarOpen(o => !o)}
                aria-label="View daily history"
                title="View daily history"
              >
                📅
              </button>
            </div>
            {calendarOpen && (
              <DailyCalendar history={dailyHistory} onClose={() => setCalendarOpen(false)} />
            )}
            <button className="btn-secondary btn-large" onClick={() => startGame('free')}>
              🎲 Free Play
            </button>
          </div>

          <FreeStatsPanel entries={freeHistory} />

          <div className="menu-how">
            <h3>How to play</h3>
            <ol>
              <li>You'll see 8 country flags one by one</li>
              <li>For each flag, pick a stat category (GDP, Population…)</li>
              <li>Each category can only be used once</li>
              <li>Lower world rank = more points (rank #1 = 100 pts)</li>
              <li>Max score: 800 pts</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'playing' && game) {
    const roundIndex = Math.min(game.currentRound, game.countries.length - 1);
    const country = game.countries[roundIndex]!;
    const displayRound = Math.min(game.currentRound + 1, game.countries.length);

    const assignmentMap = new Map(
      game.rounds.map(r => [
        r.chosenCategory.id,
        { code: r.country.code, name: r.country.name, rank: r.rank, score: r.score },
      ]),
    );

    return (
      <div className="app">
        {themeToggle}
        <div className="game-screen">
          <div className="game-header">
            <button className="btn-back" onClick={() => setScreen('menu')}>
              <span className="btn-back-arrow">←</span>
              <span>Menu</span>
            </button>
            <span className="game-progress">{displayRound} / {game.countries.length}</span>
          </div>

          <div className="game-score-card">
            <span className="game-score-label">Score</span>
            <span className="game-score-value">{game.totalScore}</span>
          </div>

          <div className="game-flag-area">
            <div className="game-country-block" key={game.currentRound}>
              <FlagEmoji code={country.code} size={116} />
              <h2 className="game-country">{country.name}</h2>
            </div>
            <p className="game-prompt"></p>
          </div>

          <div className="categories-grid">
            {game.gameCategories.map(cat => {
              const assignment = assignmentMap.get(cat.id);
              const status: 'available' | 'used' = assignment ? 'used' : 'available';
              return (
                <CategoryButton
                  key={cat.id}
                  category={cat}
                  status={status}
                  assignedCountry={assignment}
                  onClick={() => handleCategoryPick(cat)}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'results' && game) {
    return (
      <div className="app">
        {themeToggle}
        <ResultScreen
          state={game}
          onPlayAgain={handlePlayAgain}
          onSwitchMode={handleSwitchMode}
          onMenu={() => setScreen('menu')}
          dailyPlayed={dailyPlayed}
        />
      </div>
    );
  }

  return null;
}
