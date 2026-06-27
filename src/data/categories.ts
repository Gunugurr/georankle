import type { CountryStats } from './countries';

export interface Category {
  id: keyof CountryStats;
  label: string;
  description: string;
  emoji: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'population',
    label: 'Population',
    description: 'World rank by total population',
    emoji: '👥',
  },
  {
    id: 'gdp',
    label: 'GDP',
    description: 'World rank by nominal GDP',
    emoji: '💰',
  },
  {
    id: 'area',
    label: 'Land Area',
    description: 'World rank by total land area',
    emoji: '🗺️',
  },
  {
    id: 'lifeExpectancy',
    label: 'Life Expectancy',
    description: 'World rank by average life expectancy (rank 1 = longest)',
    emoji: '🏥',
  },
  {
    id: 'hdi',
    label: 'Human Development',
    description: 'World rank by Human Development Index',
    emoji: '📚',
  },
  {
    id: 'co2',
    label: 'CO₂ Emissions',
    description: 'World rank by CO₂ emissions (rank 1 = most emissions)',
    emoji: '🏭',
  },
  {
    id: 'exports',
    label: 'Exports',
    description: 'World rank by total exports value',
    emoji: '📦',
  },
  {
    id: 'militarySpending',
    label: 'Military Spending',
    description: 'World rank by military budget',
    emoji: '🛡️',
  },
  {
    id: 'tourism',
    label: 'Tourism',
    description: 'World rank by international tourist arrivals',
    emoji: '✈️',
  },
  {
    id: 'internetUsers',
    label: 'Internet Users',
    description: 'World rank by total internet users',
    emoji: '🌐',
  },
  {
    id: 'forestArea',
    label: 'Forest Area',
    description: 'World rank by total forest area',
    emoji: '🌲',
  },
  {
    id: 'nobelPrizes',
    label: 'Nobel Prizes',
    description: 'World rank by all-time Nobel Prize winners',
    emoji: '🏅',
  },
  {
    id: 'olympicMedals',
    label: 'Olympic Medals',
    description: 'World rank by all-time Summer Olympic medals',
    emoji: '🥇',
  },
  {
    id: 'coastline',
    label: 'Coastline',
    description: 'World rank by coastline length',
    emoji: '🌊',
  },
  {
    id: 'renewableEnergy',
    label: 'Renewable Energy',
    description: 'World rank by renewable energy production',
    emoji: '⚡',
  },
  {
    id: 'birthRate',
    label: 'Birth Rate',
    description: 'World rank by birth rate (rank 1 = highest)',
    emoji: '👶',
  },
  {
    id: 'unemployment',
    label: 'Unemployment',
    description: 'World rank by unemployment rate (rank 1 = highest)',
    emoji: '📉',
  },
  {
    id: 'inflation',
    label: 'Inflation',
    description: 'World rank by inflation rate (rank 1 = highest)',
    emoji: '💸',
  },
  {
    id: 'pressFredom',
    label: 'Press Freedom',
    description: 'World rank by press freedom (rank 1 = most free)',
    emoji: '📰',
  },
  {
    id: 'urbanization',
    label: 'Urbanization',
    description: 'World rank by % urban population (rank 1 = most urbanized)',
    emoji: '🏙️',
  },
];
