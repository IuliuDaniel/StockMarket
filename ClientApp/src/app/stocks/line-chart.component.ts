import { Component, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-line-chart',
  template: `<canvas [id]="chartId" [width]="canvasWidth" [height]="canvasHeight"></canvas>`,
})
export class LineChartComponent implements AfterViewInit, OnChanges {
  @Input() chartData: number[] = [];
  @Input() chartLabels: string[] = [];
  @Input() chartId: string = '';

  private chartInstance: Chart | null = null;
  canvasWidth: number = 600;
  canvasHeight: number = 200;

  ngAfterViewInit(): void {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.chartData || changes.chartLabels) {
      this.updateChart();
    }
  }

  initChart(): void {
    const ctx = (document.getElementById(this.chartId) as HTMLCanvasElement)?.getContext('2d');
    if (ctx) {
      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.chartLabels,
          datasets: [{
            label: 'One week chart',
            data: this.chartData,
            fill: false,
            borderColor: 'blue',
            tension: 0.1,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
            },
          },
        },
      });
    }
  }

  updateChart(): void {
    if (this.chartInstance) {
      this.chartInstance.data.labels = this.chartLabels;
      this.chartInstance.data.datasets[0].data = this.chartData;
      this.chartInstance.update();
    } else {
      this.initChart();
    }
  }
}
