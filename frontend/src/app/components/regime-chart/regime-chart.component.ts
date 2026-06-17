import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ElementRef, ViewChild, Output, EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { RegimeService } from '../../services/regime.service';
import { RegimeDay, REGIME_CONFIG } from '../../models/regime.model';

Chart.register(...registerables);

// How many data points to show (full history is 6000+ points — too dense to render).
// We sample every Nth point so the chart stays readable.
const SAMPLE_EVERY = 3;

@Component({
  selector: 'app-regime-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './regime-chart.component.html',
  styleUrl: './regime-chart.component.scss',
})
export class RegimeChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // Emits the regime number of the most recent data point so the
  // education panel can react to it — same pattern as an EventEmitter
  // passing data from a child to a parent.
  @Output() currentRegimeChange = new EventEmitter<number>();

  loading = true;
  error = false;
  private chart: Chart | null = null;
  private data: RegimeDay[] = [];

  readonly regimeConfig = REGIME_CONFIG;

  constructor(private regimeService: RegimeService) {}

  ngOnInit(): void {
    this.regimeService.getRegimes().subscribe({
      next: (days) => {
        this.data = days.filter((_, i) => i % SAMPLE_EVERY === 0);
        this.loading = false;
        this.buildChart();
        const last = days[days.length - 1];
        this.currentRegimeChange.emit(last.regime);
      },
      error: () => {
        this.loading = false;
        this.error = true;
      },
    });
  }

  ngAfterViewInit(): void {
    // Chart is built inside ngOnInit's subscribe callback (after data arrives),
    // so we just need AfterViewInit to guarantee the canvas DOM element exists.
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private buildChart(): void {
    if (!this.canvasRef) return;

    const labels = this.data.map((d) => d.date);
    const prices = this.data.map((d) => d.close);

    // Chart.js segment coloring: for each segment between two points,
    // we color it based on the regime of the starting point.
    // This is what creates the "colored by regime" effect on a single line.
    const segmentColor = (ctx: any): string => {
      const regime = this.data[ctx.p0DataIndex]?.regime ?? 1;
      return REGIME_CONFIG[regime].color;
    };

    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'S&P 500 Price',
            data: prices,
            borderWidth: 1.5,
            pointRadius: 0,       // no dots — too many points
            tension: 0.1,
            segment: {
              borderColor: segmentColor,
            },
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800 },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              afterLabel: (item) => {
                const day = this.data[item.dataIndex];
                if (!day) return '';
                const info = REGIME_CONFIG[day.regime];
                return [
                  `Regime: ${info.label}`,
                  `Return: ${(day.daily_return * 100).toFixed(2)}%`,
                  `Volatility: ${(day.volatility_21d * 100).toFixed(2)}%`,
                ].join('\n');
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              maxTicksLimit: 12,
              color: '#94a3b8',
            },
            grid: { color: '#1e293b' },
          },
          y: {
            ticks: { color: '#94a3b8' },
            grid: { color: '#1e293b' },
          },
        },
      },
    });
  }
}
