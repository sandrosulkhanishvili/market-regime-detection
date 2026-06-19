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
  // avgReturn and avgVolatility removed — now fetched live from /regime-stats
}

// Shape of each entry returned by GET /regime-stats
export interface RegimeStatEntry {
  avg_return: number;
  avg_volatility: number;
}

// The full response: keys are "0", "1", "2" (strings, because JSON keys are always strings)
export type RegimeStatsMap = Record<string, RegimeStatEntry>;

export const REGIME_CONFIG: Record<number, RegimeInfo> = {
  0: {
    label: 'Bull Market',
    color: '#22c55e',
    description:
      'ძლიერი პოზიტიური უკუგება ზომიერი ვოლატილობით. დამახასიათებელია ხანგრძლივი ზრდის პერიოდებისთვის.',
  },
  1: {
    label: 'Normal Market',
    color: '#3b82f6',
    description:
      'ნულთან მიახლოებული მოძრაობა დაბალი ვოლატილობით. საბაზო მდგომარეობა — ბაზრები დროის ~74%-ს ამ ფაზაში ატარებენ.',
  },
  2: {
    label: 'Bear / Crisis',
    color: '#ef4444',
    description:
      'ნეგატიური უკუგება მომატებული სტრესით. ასოცირდება რეცესიებთან, ვარდნებთან და კრიზისებთან.',
  },
};
