import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RegimeInfo,
  RegimeStatsMap,
  DEFAULT_REGIME_CONFIG,
} from '../../models/regime.model';

@Component({
  selector: 'app-education-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './education-panel.component.html',
  styleUrl: './education-panel.component.scss',
})
export class EducationPanelComponent {
  @Input() currentRegime: number = 1;
  @Input() regimeStats: RegimeStatsMap = {};
  @Input() regimeConfig: Record<number, RegimeInfo> = DEFAULT_REGIME_CONFIG;

  get currentInfo(): RegimeInfo {
    return this.regimeConfig[this.currentRegime];
  }

  // Formats a raw decimal (e.g. 0.01688) as a signed percentage string: "+1.69%"
  formatPct(value: number | undefined, decimals = 2): string {
    if (value === undefined) return '—';
    const pct = (value * 100).toFixed(decimals);
    return value >= 0 ? `+${pct}%` : `${pct}%`;
  }

  get liveReturn(): string {
    return this.formatPct(this.regimeStats[this.currentRegime]?.avg_return);
  }

  get liveVolatility(): string {
    return this.formatPct(this.regimeStats[this.currentRegime]?.avg_volatility);
  }

  readonly steps = [
    {
      title: '1. ფასების მონაცემების ჩამოტვირთვა',
      icon: '📥',
      detail:
        'yfinance იწერს S&P 500 ინდექსის ყოველდღიურ დახურვის ფასებს 2000 წლიდან — 6,600+ სავაჭრო დღე.',
    },
    {
      title: '2. მახასიათებლების ინჟინერია',
      icon: '⚙️',
      detail:
        'ყოველი დღისთვის გენერირდება ორი სიგნალი: დღიური უკუგება (% ფასის ცვლილება) და 21-დღიანი მოძრავი ვოლატილობა (ბოლოდროინდელი უკუგებების სტანდარტული გადახრა). ესენია ის X და Y ღერძები, რომლებზეც K-Means ახდენს კლასტერიზაციას.',
    },
    {
      title: '3. მონაცემთა მასშტაბირება',
      icon: '⚖️',
      detail:
        'StandardScaler აკეთებს ორივე მახასიათებლის ნორმალიზაციას (mean=0, std=1). ამის გარეშე, ვოლატილობა (მცირე რიცხვები) უბრალოდ ჩაიკარგებოდა ფასის (დიდი რიცხვების) ფონზე მანძილის გამოთვლისას.',
    },
    {
      title: '4. K-Means კლასტერები',
      icon: '🎯',
      detail:
        'K-Means ათავსებს 3 ცენტრს (centroids) 2D სივრცეში და თითოეულ დღეს ანიჭებს მასთან ყველაზე ახლოს მდგომ ცენტრს. ეს პროცესი მეორდება მანამ, სანამ განაწილება არ დასტაბილურდება. შედეგი: 3 ჯგუფი მკვეთრად გამოხატული მახასიათებლებით.',
    },
    {
      title: '5. ინტერპრეტაცია და ვიზუალიზაცია',
      icon: '📊',
      detail:
        'რიცხვითი ეტიკეტები (0, 1, 2) უკავშირდება შინაარსობრივ სახელებს თითოეული კლასტერის საშუალო უკუგებისა და ვოლატილობის ანალიზის საფუძველზე. გრაფიკის ხაზი თითოეული სეგმენტისთვის სწორედ ამ ეტიკეტების მიხედვით იფერება.',
    },
  ];
}
