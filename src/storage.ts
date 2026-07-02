export type UnlimitedMode = 'free' | 'europe' | 'evil';

export interface FreeGameEntry {
  date: string;
  totalScore: number;
  maxScore: number;
  grade: string;
  /** Entries saved before mode tracking have no mode; treat them as 'free'. */
  mode?: UnlimitedMode;
}

export function entriesForMode(entries: FreeGameEntry[], mode: UnlimitedMode): FreeGameEntry[] {
  return entries.filter(e => (e.mode ?? 'free') === mode);
}

export interface DailyGameEntry {
  dateKey: string;
  totalScore: number;
  maxScore: number;
  grade: string;
}

const FREE_HISTORY_KEY = 'georankle-free-history';
const DAILY_HISTORY_KEY = 'georankle-daily-history';
const ACHIEVEMENTS_KEY = 'georankle-achievements';

/** Map of achievement id → ISO date it was unlocked. */
export function loadAchievements(): Record<string, string> {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function unlockAchievements(ids: string[]): Record<string, string> {
  const map = loadAchievements();
  const now = new Date().toISOString();
  for (const id of ids) {
    if (!(id in map)) map[id] = now;
  }
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(map));
  return map;
}

export function loadFreeHistory(): FreeGameEntry[] {
  try {
    const raw = localStorage.getItem(FREE_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as FreeGameEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveFreeGame(entry: FreeGameEntry): void {
  const list = loadFreeHistory();
  list.push(entry);
  const trimmed = list.slice(-200);
  localStorage.setItem(FREE_HISTORY_KEY, JSON.stringify(trimmed));
}

export function loadDailyHistory(): Record<string, DailyGameEntry> {
  try {
    const raw = localStorage.getItem(DAILY_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as Record<string, DailyGameEntry>) : {};
  } catch {
    return {};
  }
}

export function saveDailyGame(entry: DailyGameEntry): void {
  const map = loadDailyHistory();
  map[entry.dateKey] = entry;
  localStorage.setItem(DAILY_HISTORY_KEY, JSON.stringify(map));
}

function dateKeyToDayNumber(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y!, m! - 1, d!) / 86400000;
}

/** Current streak counts back from today (or yesterday if today isn't played yet). */
export function computeStreaks(history: Record<string, DailyGameEntry>): {
  current: number;
  best: number;
} {
  const days = Object.keys(history).map(dateKeyToDayNumber).sort((a, b) => a - b);
  if (days.length === 0) return { current: 0, best: 0 };

  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    run = days[i]! === days[i - 1]! + 1 ? run + 1 : 1;
    if (run > best) best = run;
  }

  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000;
  const last = days[days.length - 1]!;
  let current = 0;
  if (last === today || last === today - 1) {
    current = 1;
    for (let i = days.length - 2; i >= 0; i--) {
      if (days[i]! === days[i + 1]! - 1) current++;
      else break;
    }
  }

  return { current, best };
}

export function freeStats(entries: FreeGameEntry[]): {
  count: number;
  avg: number;
  best: number;
} {
  if (entries.length === 0) return { count: 0, avg: 0, best: 0 };
  const total = entries.reduce((s, e) => s + e.totalScore, 0);
  const best = Math.max(...entries.map(e => e.totalScore));
  return {
    count: entries.length,
    avg: Math.round(total / entries.length),
    best,
  };
}
