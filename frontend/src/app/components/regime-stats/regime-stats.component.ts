import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegimeDay, REGIME_CONFIG } from '../../models/regime.model';

export interface RegimePeriod {
  regime: 0 | 1 | 2;
  startDate: string;
  endDate: string;
  durationDays: number;
  priceReturn: number;
}

export interface RegimeSummary {
  regime: 0 | 1 | 2;
  totalDays: number;
  pctOfTime: number;
  periodCount: number;
  avgDuration: number;
  longestDuration: number;
}

@Component({
  selector: 'app-regime-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './regime-stats.component.html',
  styleUrl: './regime-stats.component.scss',
})
export class RegimeStatsComponent implements OnChanges {
  @Input() data: RegimeDay[] = [];

  summaries: RegimeSummary[] = [];
  topPeriods: RegimePeriod[] = [];

  readonly regimeConfig = REGIME_CONFIG;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data.length) {
      const periods = this.computePeriods(this.data);
      this.summaries = this.computeSummaries(periods, this.data.length);
      // Top 12 longest periods across all regimes
      this.topPeriods = [...periods]
        .sort((a, b) => b.durationDays - a.durationDays)
        .slice(0, 12);
    }
  }

  // Run-length encoding: group consecutive days with the same regime.
  // Like Array.reduce() that starts a new group whenever the key changes.
  private computePeriods(data: RegimeDay[]): RegimePeriod[] {
    const periods: RegimePeriod[] = [];
    let start = 0;

    for (let i = 1; i <= data.length; i++) {
      if (i === data.length || data[i].regime !== data[start].regime) {
        const slice = data.slice(start, i);
        const startClose = slice[0].close;
        const endClose = slice[slice.length - 1].close;
        periods.push({
          regime: data[start].regime as 0 | 1 | 2,
          startDate: slice[0].date,
          endDate: slice[slice.length - 1].date,
          durationDays: slice.length,
          priceReturn: (endClose - startClose) / startClose,
        });
        start = i;
      }
    }
    return periods;
  }

  private computeSummaries(periods: RegimePeriod[], total: number): RegimeSummary[] {
    return [0, 1, 2].map((r) => {
      const rPeriods = periods.filter((p) => p.regime === r);
      const totalDays = rPeriods.reduce((s, p) => s + p.durationDays, 0);
      const durations = rPeriods.map((p) => p.durationDays);
      return {
        regime: r as 0 | 1 | 2,
        totalDays,
        pctOfTime: (totalDays / total) * 100,
        periodCount: rPeriods.length,
        avgDuration: durations.length ? Math.round(totalDays / durations.length) : 0,
        longestDuration: durations.length ? Math.max(...durations) : 0,
      };
    });
  }

  formatReturn(r: number): string {
    const pct = (r * 100).toFixed(1);
    return r >= 0 ? `+${pct}%` : `${pct}%`;
  }

  returnClass(r: number): string {
    return r >= 0 ? 'positive' : 'negative';
  }
}
