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
  avgReturn: string;
  avgVolatility: string;
}

export const REGIME_CONFIG: Record<number, RegimeInfo> = {
  0: {
    label: 'Bull Market',
    color: '#22c55e',
    description: 'Strong positive returns with moderate volatility. Typical of sustained growth periods.',
    avgReturn: '+1.69%',
    avgVolatility: '1.90%',
  },
  1: {
    label: 'Normal Market',
    color: '#3b82f6',
    description: 'Near-zero drift with low volatility. The default state — markets spend ~74% of time here.',
    avgReturn: '+0.10%',
    avgVolatility: '0.77%',
  },
  2: {
    label: 'Bear / Crisis',
    color: '#ef4444',
    description: 'Negative returns with elevated stress. Associated with recessions, crashes, and crises.',
    avgReturn: '-1.76%',
    avgVolatility: '1.67%',
  },
};
