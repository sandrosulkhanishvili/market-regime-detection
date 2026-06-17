import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegimeService } from './services/regime.service';
import { RegimeDay } from './models/regime.model';
import { RegimeChartComponent } from './components/regime-chart/regime-chart.component';
import { RegimeTimelineComponent } from './components/regime-timeline/regime-timeline.component';
import { EducationPanelComponent } from './components/education-panel/education-panel.component';
import { RegimeStatsComponent } from './components/regime-stats/regime-stats.component';

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
}
