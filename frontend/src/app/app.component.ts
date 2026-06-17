import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegimeService } from './services/regime.service';
import { RegimeDay } from './models/regime.model';
import { RegimeChartComponent } from './components/regime-chart/regime-chart.component';
import { RegimeTimelineComponent } from './components/regime-timeline/regime-timeline.component';
import { EducationPanelComponent } from './components/education-panel/education-panel.component';
import { RegimeStatsComponent } from './components/regime-stats/regime-stats.component';

export type DateRange = '1D' | '1W' | '1M' | '6M' | '1Y' | '5Y' | 'MAX';

// Approximate trading days per range label.
// We slice the last N items from the sorted data array.
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
  loading = true;
  error = false;
  currentRegime = 1;

  readonly ranges: DateRange[] = ['1D', '1W', '1M', '6M', '1Y', '5Y', 'MAX'];
  selectedRange: DateRange = 'MAX';

  constructor(private regimeService: RegimeService) {}

  ngOnInit(): void {
    this.regimeService.getRegimes().subscribe({
      next: (days) => {
        this.data = days;
        this.currentRegime = days[days.length - 1].regime;
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
  }

  // chartData is a getter — Angular re-evaluates it automatically whenever
  // selectedRange or data changes, like a computed signal or a pure pipe.
  // This is the same concept as a selector in NgRx: derived state, not stored state.
  get chartData(): RegimeDay[] {
    const days = RANGE_TRADING_DAYS[this.selectedRange];
    return isFinite(days) ? this.data.slice(-days) : this.data;
  }
}
