import {
  Component, OnChanges, OnDestroy, AfterViewInit,
  Input, ElementRef, ViewChild, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { RegimeDay, RegimeInfo, DEFAULT_REGIME_CONFIG } from '../../models/regime.model';

Chart.register(...registerables);

function sampleRate(n: number): number {
  if (n <= 300)  return 1;
  if (n <= 1000) return 2;
  return 3;
}

@Component({
  selector: 'app-regime-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './regime-chart.component.html',
  styleUrl: './regime-chart.component.scss',
})
export class RegimeChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() data: RegimeDay[] = [];
  @Input() regimeConfig: Record<number, RegimeInfo> = DEFAULT_REGIME_CONFIG;

  private viewReady = false;
  private sampledData: RegimeDay[] = [];
  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.viewReady = true;
    if (this.sampledData.length) this.buildChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data.length) {
      const rate = sampleRate(this.data.length);
      this.sampledData = this.data.filter((_, i) => i % rate === 0);
    }
    if (this.viewReady && this.sampledData.length) {
      this.chart?.destroy();
      this.buildChart();
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
      return this.regimeConfig[regime]?.color ?? '#3b82f6';
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
                const info = this.regimeConfig[day.regime];
                return [
                  `Regime: ${info?.label ?? day.regime}`,
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
