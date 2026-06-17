import {
  Component, OnChanges, OnDestroy, AfterViewInit,
  Input, ElementRef, ViewChild, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { RegimeDay, REGIME_CONFIG } from '../../models/regime.model';

Chart.register(...registerables);

const SAMPLE_EVERY = 3;

@Component({
  selector: 'app-regime-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './regime-chart.component.html',
  styleUrl: './regime-chart.component.scss',
})
export class RegimeChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // AppComponent now owns the data and passes it down.
  // Think of this like a presentational (dumb) component in Angular:
  // it only knows how to DISPLAY data, not fetch it.
  @Input() data: RegimeDay[] = [];

  private viewReady = false;
  private sampledData: RegimeDay[] = [];
  private chart: Chart | null = null;

  readonly regimeConfig = REGIME_CONFIG;

  // AfterViewInit fires when the canvas DOM element is ready.
  // We set a flag so ngOnChanges knows it's safe to draw.
  ngAfterViewInit(): void {
    this.viewReady = true;
    if (this.sampledData.length) this.buildChart();
  }

  // ngOnChanges fires whenever an @Input() value changes —
  // like subscribing to an Observable of input values.
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data.length) {
      this.sampledData = this.data.filter((_, i) => i % SAMPLE_EVERY === 0);
      if (this.viewReady) {
        this.chart?.destroy();
        this.buildChart();
      }
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private buildChart(): void {
    if (!this.canvasRef) return;

    const labels = this.sampledData.map((d) => d.date);
    const prices = this.sampledData.map((d) => d.close);

    const segmentColor = (ctx: any): string => {
      const regime = this.sampledData[ctx.p0DataIndex]?.regime ?? 1;
      return REGIME_CONFIG[regime].color;
    };

    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'S&P 500 Price',
          data: prices,
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.1,
          segment: { borderColor: segmentColor },
          fill: false,
        }],
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
                const day = this.sampledData[item.dataIndex];
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
          x: { ticks: { maxTicksLimit: 12, color: '#94a3b8' }, grid: { color: '#1e293b' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
        },
      },
    });
  }
}
