import { useState, useCallback, useEffect } from 'react';
import { COUNTRIES_UNIQUE } from './data/countries';
import { CATEGORIES } from './data/categories';
import { createGame, playRound } from './game/gameLogic';
import type { GameState } from './game/gameLogic';
import type { Category } from './data/categories';
import FlagEmoji from './components/FlagEmoji';
import CategoryButton from './components/CategoryButton';
import ResultScreen from './components/ResultScreen';

type Screen = 'menu' | 'playing' | 'results';
type Phase = 'picking' | 'revealed';

const AUTO_ADVANCE_MS = 1500;

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [phase, setPhase] = useState<Phase>('picking');
  const [game, setGame] = useState<GameState | null>(null);

  const startGame = useCallback((mode: 'daily' | 'free') => {
    const g = createGame(mode, COUNTRIES_UNIQUE, CATEGORIES);
    setGame(g);
    setPhase('picking');
    setScreen('playing');
  }, []);

  const handleCategoryPick = useCallback(
    (cat: Category) => {
      if (!game || phase !== 'picking') return;
      const updated = playRound(game, cat);
      setGame(updated);
      setPhase('revealed');
    },
    [game, phase],
  );

  const handleNext = useCallback(() => {
    if (!game) return;
    if (game.finished) {
      setScreen('results');
    } else {
      setPhase('picking');
    }
  }, [game]);

  // Auto-advance after showing the result
  useEffect(() => {
    if (phase !== 'revealed') return;
    const id = setTimeout(handleNext, AUTO_ADVANCE_MS);
    return () => clearTimeout(id);
  }, [phase, handleNext]);

  const handlePlayAgain = useCallback(() => startGame('free'), [startGame]);
  const handleSwitchMode = useCallback(() => {
    if (!game) return;
    startGame(game.mode === 'daily' ? 'free' : 'daily');
  }, [game, startGame]);

  if (screen === 'menu') {
    return (
      <div className="app">
        <div className="menu-screen">
          <div className="menu-logo">🌍</div>
          <h1 className="menu-title">GeoRankle</h1>
          <p className="menu-subtitle">Match each country to its strongest world ranking stat</p>
          <div className="menu-actions">
            <button className="btn-primary btn-large" onClick={() => startGame('daily')}>
              📅 Daily Challenge
            </button>
            <button className="btn-secondary btn-large" onClick={() => startGame('free')}>
              🎲 Free Play
            </button>
          </div>
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
    // Which round are we showing? During 'revealed', show the round we just completed.
    const roundIndex = phase === 'revealed' ? game.currentRound - 1 : game.currentRound;
    const country = game.countries[roundIndex]!;
    const displayRound = roundIndex + 1;
    const lastRound = game.rounds[game.rounds.length - 1];

    // Build a map of categoryId → assigned country info (for used buttons)
    const assignmentMap = new Map(
      game.rounds.map(r => [
        r.chosenCategory.id,
        { code: r.country.code, name: r.country.name, rank: r.rank, score: r.score },
      ]),
    );

    return (
      <div className="app">
        <div className="game-screen">
          <div className="game-header">
            <button className="btn-back" onClick={() => setScreen('menu')}>← Menu</button>
            <span className="game-progress">{displayRound} / {game.countries.length}</span>
            <span className="game-score">🏆 {game.totalScore}</span>
          </div>

          <div className="game-flag-area">
            <FlagEmoji code={country.code} size={96} />
            <h2 className="game-country">{country.name}</h2>
            {phase === 'revealed' && lastRound ? (
              <p className="game-result-line">
                {lastRound.chosenCategory.emoji} {lastRound.chosenCategory.label} — rank #{lastRound.rank} →{' '}
                <strong>{lastRound.score} pts</strong>
              </p>
            ) : (
              <p className="game-prompt">Pick the best category for this country</p>
            )}
          </div>

          {phase === 'revealed' && (
            <div className="auto-advance-bar">
              <div className="auto-advance-fill" />
            </div>
          )}

          <div className="categories-grid">
            {game.gameCategories.map(cat => {
              const assignment = assignmentMap.get(cat.id);
              const isJustRevealed =
                phase === 'revealed' && lastRound?.chosenCategory.id === cat.id;
              const status = isJustRevealed
                ? 'revealed'
                : assignment
                ? 'used'
                : 'available';

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
        <ResultScreen state={game} onPlayAgain={handlePlayAgain} onSwitchMode={handleSwitchMode} />
      </div>
    );
  }

  return null;
}
