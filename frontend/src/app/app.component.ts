import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { RegimeService } from './services/regime.service';
import { RegimeDay, RegimeStatsMap } from './models/regime.model';
import { RegimeChartComponent } from './components/regime-chart/regime-chart.component';
import { RegimeTimelineComponent } from './components/regime-timeline/regime-timeline.component';
import { EducationPanelComponent } from './components/education-panel/education-panel.component';
import { RegimeStatsComponent } from './components/regime-stats/regime-stats.component';

export type DateRange = '1D' | '1W' | '1M' | '6M' | '1Y' | '5Y' | 'MAX';

const RANGE_TRADING_DAYS: Record<DateRange, number> = {
  '1D':  1,
  '1W':  5,
  '1M':  22,
  '6M':  130,
  '1Y':  252,
  '5Y':  1260,
  'MAX': Infinity,
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RegimeChartComponent,
    RegimeTimelineComponent,
    EducationPanelComponent,
    RegimeStatsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  data: RegimeDay[] = [];
  regimeStats: RegimeStatsMap = {};
  loading = true;
  error = false;
  currentRegime = 1;

  readonly ranges: DateRange[] = ['1D', '1W', '1M', '6M', '1Y', '5Y', 'MAX'];
  selectedRange: DateRange = 'MAX';
  chartData: RegimeDay[] = [];

  constructor(private regimeService: RegimeService) {}

  ngOnInit(): void {
    // forkJoin fires both HTTP requests simultaneously and emits once when BOTH complete.
    // This is RxJS's equivalent of Promise.all([req1, req2]).
    // Without forkJoin we'd have to nest the calls (callback hell) or chain them
    // sequentially, which would add unnecessary latency.
    forkJoin({
      days: this.regimeService.getRegimes(),
      stats: this.regimeService.getRegimeStats(),
    }).subscribe({
      next: ({ days, stats }) => {
        this.data = days;
        this.regimeStats = stats;
        this.currentRegime = days[days.length - 1].regime;
        this.chartData = days;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      },
    });
  }

  setRange(range: DateRange): void {
    this.selectedRange = range;
    const days = RANGE_TRADING_DAYS[range];
    this.chartData = isFinite(days) ? this.data.slice(-days) : this.data;
  }
}
