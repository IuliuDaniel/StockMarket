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
  canvasWidth: number = 400;
  canvasHeight: number = 10;

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
      const isPositiveTrend = this.chartData[0] < this.chartData[this.chartData.length - 1];
      const lineColor = isPositiveTrend ? 'limegreen' : 'orangered';
      const fillColor = isPositiveTrend ? 'rgba(50, 205, 50, 0.2)' : 'rgba(255, 69, 0, 0.2)'; // Brighter green/red background

      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.chartLabels,
          datasets: [{
            label: 'One week chart',
            data: this.chartData,
            fill: true, // Enable background below the line
            backgroundColor: fillColor, // Bright green or red background fill
            borderColor: lineColor, // Bright line color
            borderWidth: 5, // Thicker line
            tension: 0.3,
            pointRadius: 2, // Bigger points
            pointBackgroundColor: lineColor, // Points matching line color
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: true,
            },
          },
          scales: {
            x: {
              display: false,
            },
            y: {
              display: false,
            },
          },
          elements: {
            point: {
              radius: 3, // Control point size here
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
