import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { REGIME_CONFIG, RegimeInfo } from '../../models/regime.model';

@Component({
  selector: 'app-education-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './education-panel.component.html',
  styleUrl: './education-panel.component.scss',
})
export class EducationPanelComponent {
  // Receives the current regime number from the parent (AppComponent),
  // which gets it from RegimeChartComponent via (currentRegimeChange).
  @Input() currentRegime: number = 1;

  get currentInfo(): RegimeInfo {
    return REGIME_CONFIG[this.currentRegime];
  }

  readonly steps = [
    {
      title: '1. Fetch Price Data',
      icon: '📥',
      detail: 'yfinance downloads daily S&P 500 closing prices back to 2000 — 6,600+ trading days.',
    },
    {
      title: '2. Engineer Features',
      icon: '⚙️',
      detail: 'Two signals are derived per day: daily return (% price change) and 21-day rolling volatility (standard deviation of recent returns). These become the X and Y axes K-Means clusters on.',
    },
    {
      title: '3. Scale the Features',
      icon: '⚖️',
      detail: 'StandardScaler normalizes both features to mean=0, std=1. Without this, volatility (small numbers) would be drowned out by price (large numbers) in distance calculations.',
    },
    {
      title: '4. K-Means Clusters',
      icon: '🎯',
      detail: 'K-Means places 3 "centroids" in the 2D space and assigns each day to its nearest centroid. It repeats this until the assignments stabilize. The result: 3 groups with distinct personalities.',
    },
    {
      title: '5. Interpret & Visualize',
      icon: '📊',
      detail: 'The numeric labels (0, 1, 2) are mapped to meaningful names by analyzing each cluster\'s average return and volatility. The chart line is colored per-segment using those labels.',
    },
  ];
}
