import { Component } from '@angular/core';
import { RegimeChartComponent } from './components/regime-chart/regime-chart.component';
import { EducationPanelComponent } from './components/education-panel/education-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RegimeChartComponent, EducationPanelComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  // Shared state: RegimeChartComponent emits the latest regime via
  // (currentRegimeChange), and we pass it down to EducationPanelComponent
  // via [currentRegime]. Classic parent-as-mediator pattern.
  currentRegime = 1;
}
