import {
  Component, Input, OnChanges, AfterViewInit,
  ViewChild, ElementRef, SimpleChanges, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegimeDay, REGIME_CONFIG } from '../../models/regime.model';

@Component({
  selector: 'app-regime-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './regime-timeline.component.html',
  styleUrl: './regime-timeline.component.scss',
})
export class RegimeTimelineComponent implements OnChanges, AfterViewInit {
  @ViewChild('timelineCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() data: RegimeDay[] = [];

  // Year labels to render below the bar (sampled every 2 years)
  yearLabels: { label: string; pct: number }[] = [];

  private viewReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    if (this.data.length) this.draw();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data.length && this.viewReady) {
      this.draw();
    }
  }

  // Redraw on window resize so the canvas stays sharp
  @HostListener('window:resize')
  onResize(): void {
    if (this.data.length && this.viewReady) this.draw();
  }

  private draw(): void {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement!;
    // Match canvas resolution to actual pixel width (prevents blurry canvas)
    const dpr = window.devicePixelRatio || 1;
    const w = container.offsetWidth;
    const h = container.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const n = this.data.length;

    // Draw one colored rect per day.
    // dayWidth might be a fraction — Math.ceil avoids 1-pixel gaps between rects.
    this.data.forEach((day, i) => {
      const x = (i / n) * w;
      const nextX = ((i + 1) / n) * w;
      ctx.fillStyle = REGIME_CONFIG[day.regime].color + 'cc'; // slight transparency
      ctx.fillRect(x, 0, Math.ceil(nextX - x), h);
    });

    // Compute year label positions as % of total width for the template to render
    this.yearLabels = [];
    let lastYear = '';
    this.data.forEach((day, i) => {
      const year = day.date.slice(0, 4);
      if (year !== lastYear && parseInt(year) % 2 === 0) {
        lastYear = year;
        this.yearLabels.push({ label: year, pct: (i / n) * 100 });
      }
    });
  }
}
