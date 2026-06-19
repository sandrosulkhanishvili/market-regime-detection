export interface RegimeDay {
  date: string;
  close: number;
  daily_return: number;
  volatility_21d: number;
  regime: 0 | 1 | 2;
}

export interface RegimeInfo {
  label: string;
  color: string;
  description: string;
}

export interface RegimeStatEntry {
  avg_return: number;
  avg_volatility: number;
}

export type RegimeStatsMap = Record<string, RegimeStatEntry>;

// Static visual properties per SEMANTIC ROLE — not tied to any cluster number.
// K-Means assigns cluster numbers arbitrarily (0, 1, 2 can mean anything).
// We decide which role a cluster plays by ranking its avg_return after the fact.
const ROLE_CONFIG = {
  bull: {
    label: 'Bull Market',
    color: '#22c55e',
    description: 'ძლიერი პოზიტიური უკუგება ზომიერი ვოლატილობით. დამახასიათებელია ხანგრძლივი ზრდის პერიოდებისთვის.',
  },
  normal: {
    label: 'Normal Market',
    color: '#3b82f6',
    description: 'ნულთან მიახლოებული მოძრაობა დაბალი ვოლატილობით. საბაზო მდგომარეობა — ბაზრები დროის ~74%-ს ამ ფაზაში ატარებენ.',
  },
  bear: {
    label: 'Bear / Crisis',
    color: '#ef4444',
    description: 'ნეგატიური უკუგება მომატებული სტრესით. ასოცირდება რეცესიებთან, ვარდნებთან და კრიზისებთან.',
  },
};

// Fallback used before live stats arrive (only during the loading spinner phase).
export const DEFAULT_REGIME_CONFIG: Record<number, RegimeInfo> = {
  0: ROLE_CONFIG.bull,
  1: ROLE_CONFIG.normal,
  2: ROLE_CONFIG.bear,
};

/**
 * Builds the correct cluster-number → RegimeInfo mapping from live API stats.
 *
 * Sort clusters by avg_return descending:
 *   rank 0 (highest return) → Bull
 *   rank 1 (middle return)  → Normal
 *   rank 2 (lowest return)  → Bear / Crisis
 *
 * This makes the labeling immune to K-Means' arbitrary cluster numbering.
 */
export function buildRegimeConfig(stats: RegimeStatsMap): Record<number, RegimeInfo> {
  const roles = [ROLE_CONFIG.bull, ROLE_CONFIG.normal, ROLE_CONFIG.bear];

  const sorted = Object.entries(stats)
    .sort(([, a], [, b]) => b.avg_return - a.avg_return); // highest return first

  const config: Record<number, RegimeInfo> = {};
  sorted.forEach(([key], index) => {
    config[Number(key)] = roles[index];
  });
  return config;
}
