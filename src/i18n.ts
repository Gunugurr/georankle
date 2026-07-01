import { createContext, useContext } from 'react';
import type { CountryStats } from './data/countries';

export type Language = 'en' | 'tr';

export const STRINGS = {
  en: {
    appName: 'GeoRankle',
    subtitle: 'Match each country to its strongest world ranking stat',
    dailyChallenge: '📅 Daily Challenge',
    dailyDone: "✅ Today's Daily Done",
    freePlay: '🎲 Free Play',
    evilMode: '😈 Evil Mode',
    evilModeDesc: 'Reversed scoring — the worst-ranked stat scores highest',
    evilModeInfo: 'Reversed scoring: pick the stat where this country ranks worst for the most points.',
    howToPlay: 'How to play',
    rules: [
      "You'll see 8 country flags one by one",
      'For each flag, pick a stat category (GDP, Population…)',
      'Each category can only be used once',
      'Lower world rank = more points (rank #1 = 100 pts)',
      'Max score depends on the 8 countries you get',
    ],
    score: 'Score',
    menu: 'Menu',
    gameOver: 'Game Over',
    roundByRound: 'Round by round',
    best: 'best:',
    playAgain: 'Play Again',
    playFreeMode: 'Play Free Mode',
    dailyDoneShort: '✅ Daily Done',
    dailyHistory: '📅 Daily History',
    freeStats: '🎲 Free Play Stats',
    played: 'Played',
    avg: 'Avg',
    bestStat: 'Best',
    noFreeGames: 'No free games played yet',
    viewDailyHistory: 'View daily history',
    closeCalendar: 'Close calendar',
    playThisDay: 'Play this day',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
    weekdays: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
  },
  tr: {
    appName: 'GeoRankle',
    subtitle: 'Her ülkeyi en güçlü olduğu dünya sıralaması istatistiğine eşle',
    dailyChallenge: '📅 Günlük Görev',
    dailyDone: '✅ Bugünün Görevi Tamam',
    freePlay: '🎲 Serbest Oyun',
    evilMode: '😈 Şeytan Modu',
    evilModeDesc: 'Ters puanlama — en kötü sıralanan istatistik en yüksek puanı verir',
    evilModeInfo: 'Ters puanlama: en çok puan için bu ülkenin en kötü sıralandığı istatistiği seç.',
    howToPlay: 'Nasıl oynanır',
    rules: [
      '8 ülke bayrağını sırayla göreceksin',
      'Her bayrağa bir istatistik kategorisi seç (GSYİH, Nüfus…)',
      'Her kategori sadece bir kez kullanılabilir',
      'Sıralama ne kadar düşükse o kadar fazla puan (1. = 100 puan)',
      'Maksimum puan oyunda gelen 8 ülkeye göre değişir',
    ],
    score: 'Skor',
    menu: 'Menü',
    gameOver: 'Oyun Bitti',
    roundByRound: 'Tur tur',
    best: 'en iyi:',
    playAgain: 'Tekrar Oyna',
    playFreeMode: 'Serbest Oyun',
    dailyDoneShort: '✅ Günlük Tamam',
    dailyHistory: '📅 Günlük Geçmiş',
    freeStats: '🎲 Serbest Oyun İstatistikleri',
    played: 'Oynanan',
    avg: 'Ort.',
    bestStat: 'En İyi',
    noFreeGames: 'Henüz serbest oyun yok',
    viewDailyHistory: 'Günlük geçmişi gör',
    closeCalendar: 'Takvimi kapat',
    playThisDay: 'Bu günü oyna',
    previousMonth: 'Önceki ay',
    nextMonth: 'Sonraki ay',
    switchToLight: 'Aydınlık moda geç',
    switchToDark: 'Karanlık moda geç',
    weekdays: ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'],
    months: [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
    ],
  },
} as const;

export const CATEGORY_LABELS: Record<Language, Record<keyof CountryStats, string>> = {
  en: {
    population: 'Population',
    gdp: 'GDP',
    area: 'Land Area',
    lifeExpectancy: 'Life Expectancy',
    hdi: 'Human Development',
    co2: 'CO₂ Emissions',
    exports: 'Exports',
    militarySpending: 'Military Spending',
    tourism: 'Tourism',
    internetUsers: 'Internet Users',
    forestArea: 'Forest Area',
    nobelPrizes: 'Nobel Prizes',
    olympicMedals: 'Olympic Medals',
    coastline: 'Coastline',
    renewableEnergy: 'Renewable Energy',
    birthRate: 'Birth Rate',
    unemployment: 'Unemployment',
    inflation: 'Inflation',
    pressFredom: 'Press Freedom',
    urbanization: 'Urbanization',
  },
  tr: {
    population: 'Nüfus',
    gdp: 'GSYİH',
    area: 'Yüzölçümü',
    lifeExpectancy: 'Yaşam Süresi',
    hdi: 'İnsani Gelişim',
    co2: 'CO₂ Salınımı',
    exports: 'İhracat',
    militarySpending: 'Askeri Harcama',
    tourism: 'Turizm',
    internetUsers: 'İnternet Kullanıcısı',
    forestArea: 'Orman Alanı',
    nobelPrizes: 'Nobel Ödülleri',
    olympicMedals: 'Olimpiyat Madalyaları',
    coastline: 'Sahil Şeridi',
    renewableEnergy: 'Yenilenebilir Enerji',
    birthRate: 'Doğum Oranı',
    unemployment: 'İşsizlik',
    inflation: 'Enflasyon',
    pressFredom: 'Basın Özgürlüğü',
    urbanization: 'Kentleşme',
  },
};

export const CATEGORY_DESCRIPTIONS: Record<Language, Record<keyof CountryStats, string>> = {
  en: {
    population: 'World rank by total population',
    gdp: 'World rank by nominal GDP',
    area: 'World rank by total land area',
    lifeExpectancy: 'World rank by average life expectancy (rank 1 = longest)',
    hdi: 'World rank by Human Development Index',
    co2: 'World rank by CO₂ emissions (rank 1 = most emissions)',
    exports: 'World rank by total exports value',
    militarySpending: 'World rank by military budget',
    tourism: 'World rank by international tourist arrivals',
    internetUsers: 'World rank by total internet users',
    forestArea: 'World rank by total forest area',
    nobelPrizes: 'World rank by all-time Nobel Prize winners',
    olympicMedals: 'World rank by all-time Summer Olympic medals',
    coastline: 'World rank by coastline length',
    renewableEnergy: 'World rank by renewable energy production',
    birthRate: 'World rank by birth rate (rank 1 = highest)',
    unemployment: 'World rank by unemployment rate (rank 1 = highest)',
    inflation: 'World rank by inflation rate (rank 1 = highest)',
    pressFredom: 'World rank by press freedom (rank 1 = most free)',
    urbanization: 'World rank by % urban population (rank 1 = most urbanized)',
  },
  tr: {
    population: 'Toplam nüfusa göre dünya sıralaması',
    gdp: 'Nominal GSYİH göre dünya sıralaması',
    area: 'Toplam yüzölçümüne göre dünya sıralaması',
    lifeExpectancy: 'Ortalama yaşam süresine göre dünya sıralaması (1. = en uzun)',
    hdi: 'İnsani Gelişim Endeksi sıralaması',
    co2: 'CO₂ salınımına göre dünya sıralaması (1. = en fazla)',
    exports: 'Toplam ihracat değerine göre dünya sıralaması',
    militarySpending: 'Askeri bütçeye göre dünya sıralaması',
    tourism: 'Uluslararası turist sayısına göre dünya sıralaması',
    internetUsers: 'Toplam internet kullanıcısına göre dünya sıralaması',
    forestArea: 'Orman alanına göre dünya sıralaması',
    nobelPrizes: 'Tüm zamanların Nobel Ödülü kazananlarına göre',
    olympicMedals: 'Tüm zamanların Yaz Olimpiyatları madalyalarına göre',
    coastline: 'Sahil şeridi uzunluğuna göre dünya sıralaması',
    renewableEnergy: 'Yenilenebilir enerji üretimine göre dünya sıralaması',
    birthRate: 'Doğum oranına göre dünya sıralaması (1. = en yüksek)',
    unemployment: 'İşsizlik oranına göre dünya sıralaması (1. = en yüksek)',
    inflation: 'Enflasyon oranına göre dünya sıralaması (1. = en yüksek)',
    pressFredom: 'Basın özgürlüğüne göre dünya sıralaması (1. = en özgür)',
    urbanization: 'Kentsel nüfus yüzdesine göre dünya sıralaması (1. = en kentsel)',
  },
};

const LangContext = createContext<Language>('en');
export const LangProvider = LangContext.Provider;

export function useLang(): Language {
  return useContext(LangContext);
}

export function useStrings() {
  return STRINGS[useLang()];
}

export function categoryLabel(id: keyof CountryStats, lang: Language): string {
  return CATEGORY_LABELS[lang][id];
}

export function categoryDescription(id: keyof CountryStats, lang: Language): string {
  return CATEGORY_DESCRIPTIONS[lang][id];
}
