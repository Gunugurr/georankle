import { useState, useCallback, useEffect, useMemo } from 'react';
import { COUNTRIES_UNIQUE, COUNTRIES_EUROPE } from './data/countries';
import { CATEGORIES } from './data/categories';
import { createGame, playRound, maxPossibleScore, grade } from './game/gameLogic';
import type { GameState, GameMode } from './game/gameLogic';
import type { Category } from './data/categories';
import FlagEmoji from './components/FlagEmoji';
import CategoryButton from './components/CategoryButton';
import ResultScreen from './components/ResultScreen';
import DailyCalendar from './components/DailyCalendar';
import FreeStatsPanel from './components/FreeStatsPanel';
import AchievementsPanel from './components/AchievementsPanel';
import {
  loadFreeHistory,
  loadDailyHistory,
  saveFreeGame,
  saveDailyGame,
  computeStreaks,
  loadAchievements,
  unlockAchievements,
} from './storage';
import type { FreeGameEntry, DailyGameEntry } from './storage';
import { checkAchievements, ACHIEVEMENT_IDS } from './achievements';
import type { AchievementId } from './achievements';
import { LangProvider, STRINGS, countryName } from './i18n';
import type { Language } from './i18n';

type Screen = 'menu' | 'playing' | 'results';
type Theme = 'dark' | 'light';

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

interface DuelInvite {
  seed: number;
  mode: GameMode;
  target: number | null;
}

function parseDuelFromUrl(): DuelInvite | null {
  const params = new URLSearchParams(window.location.search);
  const rawSeed = params.get('duel');
  if (!rawSeed) return null;
  const seed = Number(rawSeed);
  if (!Number.isFinite(seed)) return null;
  const m = params.get('mode');
  const mode: GameMode = m === 'europe' || m === 'evil' ? m : 'free';
  const rawTarget = params.get('target');
  const target = rawTarget !== null && Number.isFinite(Number(rawTarget)) ? Number(rawTarget) : null;
  return { seed, mode, target };
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
  const [statsOpen, setStatsOpen] = useState(false);
  const [achOpen, setAchOpen] = useState(false);
  const [achievements, setAchievements] = useState<Record<string, string>>(() =>
    loadAchievements(),
  );
  const [newUnlocks, setNewUnlocks] = useState<AchievementId[]>([]);
  const [duelInvite, setDuelInvite] = useState<DuelInvite | null>(() => parseDuelFromUrl());
  const [duelTarget, setDuelTarget] = useState<number | null>(null);

  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const s = STRINGS[lang];
  const dailyPlayed = !!dailyHistory[todayKey()];
  const streaks = useMemo(() => computeStreaks(dailyHistory), [dailyHistory]);

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

  const startGame = useCallback(
    (mode: GameMode, date?: Date, seed?: number, target?: number | null) => {
      const pool = mode === 'europe' ? COUNTRIES_EUROPE : COUNTRIES_UNIQUE;
      const g = createGame(mode, pool, CATEGORIES, date, seed);
      setGame(g);
      setDuelTarget(target ?? null);
      setNewUnlocks([]);
      setScreen('playing');
    },
    [],
  );

  const handleAcceptDuel = useCallback(() => {
    if (!duelInvite) return;
    startGame(duelInvite.mode, undefined, duelInvite.seed, duelInvite.target);
    setDuelInvite(null);
  }, [duelInvite, startGame]);

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
        let newFree = freeHistory;
        let newDaily = dailyHistory;
        if (updated.mode === 'daily') {
          const entry: DailyGameEntry = {
            dateKey: updated.dailyDateKey ?? todayKey(),
            totalScore: updated.totalScore,
            maxScore: max,
            grade: g,
          };
          saveDailyGame(entry);
          newDaily = { ...dailyHistory, [entry.dateKey]: entry };
          setDailyHistory(newDaily);
        } else {
          const entry: FreeGameEntry = {
            date: new Date().toISOString(),
            totalScore: updated.totalScore,
            maxScore: max,
            grade: g,
            mode: updated.mode,
          };
          saveFreeGame(entry);
          newFree = [...freeHistory, entry];
          setFreeHistory(newFree);
        }
        const unlockedNow = checkAchievements({
          state: updated,
          grade: g,
          freeHistory: newFree,
          dailyHistory: newDaily,
          currentStreak: computeStreaks(newDaily).current,
          unlocked: achievements,
        });
        if (unlockedNow.length > 0) setAchievements(unlockAchievements(unlockedNow));
        setNewUnlocks(unlockedNow);
        setScreen('results');
      }
    },
    [game, freeHistory, dailyHistory, achievements],
  );

  const handlePlayAgain = useCallback(() => {
    const mode = game?.mode;
    startGame(mode && mode !== 'daily' ? mode : 'free');
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
      {screen === 'menu' && (
        <button
          className={`ach-toggle${achOpen ? ' ach-toggle--active' : ''}`}
          onClick={() => setAchOpen(o => !o)}
          aria-label={s.achievementsTitle}
          title={s.achievementsTitle}
        >
          🏆 {s.achievementsTitle}
        </button>
      )}
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
          {duelInvite && (
            <section className="menu-section menu-section--duel">
              <div className="menu-section-header">{s.duelInviteTitle}</div>
              {duelInvite.target !== null && (
                <p className="menu-section-desc duel-target-desc">
                  {s.duelTarget}: <strong>{duelInvite.target}</strong>
                </p>
              )}
              <div className="duel-invite-actions">
                <button className="btn-primary" onClick={handleAcceptDuel}>
                  {s.duelAccept}
                </button>
                <button className="btn-secondary" onClick={() => setDuelInvite(null)}>
                  {s.duelDismiss}
                </button>
              </div>
            </section>
          )}
          <section className="menu-section">
            <div className="menu-section-header-row">
              <div className="menu-section-header">{s.dailySectionTitle}</div>
              {streaks.current >= 2 && (
                <span
                  className="streak-badge"
                  title={`${streaks.current} ${s.streakLabel}`}
                  aria-label={`${streaks.current} ${s.streakLabel}`}
                >
                  🔥 {streaks.current}
                </span>
              )}
            </div>
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
            <p className="menu-section-desc">{s.dailyDesc}</p>
            {calendarOpen && (
              <DailyCalendar
                history={dailyHistory}
                onClose={() => setCalendarOpen(false)}
                onPlayDate={handlePlayPastDaily}
              />
            )}
          </section>

          <section className="menu-section">
            <div className="menu-section-header-row">
              <div className="menu-section-header">{s.unlimitedSectionTitle}</div>
              <button
                className={`stats-toggle${statsOpen ? ' stats-toggle--active' : ''}`}
                onClick={() => setStatsOpen(o => !o)}
                aria-label={s.viewStats}
                title={s.viewStats}
              >
                📊 {s.statsButton}
              </button>
            </div>
            <div className="mode-row">
              <button className="mode-btn" onClick={() => startGame('free')}>
                <span className="mode-btn-emoji">🌍</span>
                <span className="mode-btn-text">
                  <span className="mode-btn-title">{s.worldModeTitle}</span>
                  <span className="mode-btn-desc">{s.worldModeDesc}</span>
                </span>
              </button>
              <button className="mode-btn" onClick={() => startGame('europe')}>
                <span className="mode-btn-emoji">
                  <FlagEmoji code="EU" size={28} />
                </span>
                <span className="mode-btn-text">
                  <span className="mode-btn-title">{s.europeModeTitle}</span>
                  <span className="mode-btn-desc">{s.europeModeDesc}</span>
                </span>
              </button>
            </div>
            <button className="mode-btn mode-btn--evil" onClick={() => startGame('evil')}>
              <span className="mode-btn-emoji">😈</span>
              <span className="mode-btn-text">
                <span className="mode-btn-title">{s.evilModeTitle}</span>
                <span className="mode-btn-desc">{s.evilModeDesc}</span>
              </span>
            </button>
            {statsOpen && <FreeStatsPanel entries={freeHistory} />}
          </section>
        </div>

        {achOpen && (
          <div className="ach-overlay" onClick={() => setAchOpen(false)}>
            <div className="ach-modal" onClick={e => e.stopPropagation()}>
              <div className="ach-modal-header">
                <span className="ach-modal-title">
                  🏆 {s.achievementsTitle} ·{' '}
                  {ACHIEVEMENT_IDS.filter(id => id in achievements).length}/
                  {ACHIEVEMENT_IDS.length}
                </span>
                <button
                  className="ach-modal-close"
                  onClick={() => setAchOpen(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <AchievementsPanel unlocked={achievements} />
            </div>
          </div>
        )}

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
        {
          code: r.country.code,
          name: countryName(r.country.code, r.country.name, lang),
          rank: r.rank,
          score: r.score,
        },
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
              <h2 className="game-country">{countryName(country.code, country.name, lang)}</h2>
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
          streak={streaks.current}
          duelTarget={duelTarget}
          newUnlocks={newUnlocks}
        />
      </div>
    );
  }

  return <LangProvider value={lang}>{body}</LangProvider>;
}
