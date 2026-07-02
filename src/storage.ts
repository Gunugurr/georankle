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
