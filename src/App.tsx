import { useState, useCallback, useEffect } from 'react';
import { COUNTRIES_UNIQUE } from './data/countries';
import { CATEGORIES } from './data/categories';
import { createGame, playRound, maxPossibleScore, grade } from './game/gameLogic';
import type { GameState, GameMode } from './game/gameLogic';
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
import { LangProvider, STRINGS } from './i18n';
import type { Language } from './i18n';

type Screen = 'menu' | 'playing' | 'results';
type Theme = 'dark' | 'light';

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function detectDefaultLang(): Language {
  const stored = localStorage.getItem('georankle-lang');
  if (stored === 'tr' || stored === 'en') return stored;
  const browser = navigator.language.toLowerCase();
  return browser.startsWith('tr') ? 'tr' : 'en';
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [game, setGame] = useState<GameState | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    return localStorage.getItem('georankle-theme') === 'light' ? 'light' : 'dark';
  });
  const [lang, setLang] = useState<Language>(detectDefaultLang);
  const [freeHistory, setFreeHistory] = useState<FreeGameEntry[]>(() => loadFreeHistory());
  const [dailyHistory, setDailyHistory] = useState<Record<string, DailyGameEntry>>(() =>
    loadDailyHistory(),
  );
  const [calendarOpen, setCalendarOpen] = useState(false);

  const s = STRINGS[lang];
  const dailyPlayed = !!dailyHistory[todayKey()];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('georankle-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('georankle-lang', lang);
  }, [lang]);

  const evilActive = screen !== 'menu' && game?.mode === 'evil';
  useEffect(() => {
    document.documentElement.setAttribute('data-mode', evilActive ? 'evil' : 'normal');
  }, [evilActive]);

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const toggleLang = useCallback(() => {
    setLang(l => (l === 'en' ? 'tr' : 'en'));
  }, []);

  const startGame = useCallback((mode: GameMode, date?: Date) => {
    const g = createGame(mode, COUNTRIES_UNIQUE, CATEGORIES, date);
    setGame(g);
    setScreen('playing');
  }, []);

  const handlePlayPastDaily = useCallback(
    (date: Date) => {
      startGame('daily', date);
      setCalendarOpen(false);
    },
    [startGame],
  );

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
            dateKey: updated.dailyDateKey ?? todayKey(),
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

  const handlePlayAgain = useCallback(() => {
    startGame(game?.mode === 'evil' ? 'evil' : 'free');
  }, [game, startGame]);
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

  const floatingControls = (
    <div className="floating-controls">
      <button
        className="lang-toggle"
        onClick={toggleLang}
        aria-label="Toggle language"
        title="Toggle language"
      >
        {lang === 'en' ? 'TR' : 'EN'}
      </button>
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? s.switchToLight : s.switchToDark}
        title={theme === 'dark' ? s.switchToLight : s.switchToDark}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  );

  const menuScreen = (
    <div className="app">
      {floatingControls}
      <div className="menu-screen">
        <div className="menu-logo">🌍</div>
        <h1 className="menu-title">{s.appName}</h1>
        <p className="menu-subtitle">{s.subtitle}</p>
        <div className="menu-actions">
          <div className="daily-row">
            <button
              className="btn-primary btn-large"
              onClick={() => startGame('daily')}
              disabled={dailyPlayed}
            >
              {dailyPlayed ? s.dailyDone : s.dailyChallenge}
            </button>
            <button
              className={`calendar-toggle${calendarOpen ? ' calendar-toggle--active' : ''}`}
              onClick={() => setCalendarOpen(o => !o)}
              aria-label={s.viewDailyHistory}
              title={s.viewDailyHistory}
            >
              📅
            </button>
          </div>
          {calendarOpen && (
            <DailyCalendar
              history={dailyHistory}
              onClose={() => setCalendarOpen(false)}
              onPlayDate={handlePlayPastDaily}
            />
          )}
          <button className="btn-secondary btn-large" onClick={() => startGame('free')}>
            {s.freePlay}
          </button>
          <button
            className="btn-evil btn-large"
            onClick={() => startGame('evil')}
            title={s.evilModeDesc}
          >
            {s.evilMode}
          </button>
        </div>

        <FreeStatsPanel entries={freeHistory} />

        <div className="menu-how">
          <h3>{s.howToPlay}</h3>
          <ol>
            {s.rules.map((rule, i) => (
              <li key={i}>{rule}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );

  let body: React.ReactNode = null;

  if (screen === 'menu') {
    body = menuScreen;
  } else if (screen === 'playing' && game) {
    const roundIndex = Math.min(game.currentRound, game.countries.length - 1);
    const country = game.countries[roundIndex]!;
    const displayRound = Math.min(game.currentRound + 1, game.countries.length);

    const assignmentMap = new Map(
      game.rounds.map(r => [
        r.chosenCategory.id,
        { code: r.country.code, name: r.country.name, rank: r.rank, score: r.score },
      ]),
    );

    body = (
      <div className="app">
        {floatingControls}
        <div className="game-screen">
          <div className="game-header">
            <button className="btn-back" onClick={() => setScreen('menu')}>
              <span className="btn-back-arrow">←</span>
              <span>{s.menu}</span>
            </button>
            <span className="game-progress">{displayRound} / {game.countries.length}</span>
          </div>

          <div className="game-score-card">
            <span className="game-score-label">{s.score}</span>
            <span className="game-score-value">{game.totalScore}</span>
          </div>

          <div className="game-flag-area">
            {game.mode === 'evil' && (
              <>
                <span className="evil-badge">{s.evilMode}</span>
                <p className="evil-info">{s.evilModeInfo}</p>
              </>
            )}
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
  } else if (screen === 'results' && game) {
    body = (
      <div className="app">
        {floatingControls}
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

  return <LangProvider value={lang}>{body}</LangProvider>;
}
