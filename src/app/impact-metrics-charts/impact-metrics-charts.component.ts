import { Component, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-impact-metrics-charts',
  standalone: true,
  imports: [],
  templateUrl: './impact-metrics-charts.component.html',
  styleUrl: './impact-metrics-charts.component.scss'
})
export class ImpactMetricsChartsComponent implements AfterViewInit {


  ngAfterViewInit(): void {
    this.loadPieChart();
    this.loadBarChart();
  }

  loadPieChart() {
    new Chart("pieChartCanvas", {
      type: 'pie',
      data: {
        labels: [
          'Service Projects', 'Community Events', 'Food Rescues', 'NEST Tutors',
          'Notes of Kindness', 'Workshops', 'Donations', 'Other'
        ],
        datasets: [{
          data: [25.7, 13.2, 30.2, 7.2, 5.9, 3.8, 1.0, 13],
          backgroundColor: [
            '#6A5ACD', '#7EA4FF', '#8BC34A', '#FFF176',
            '#FF8A65', '#E57373', '#CE93D8', '#BDBDBD'
          ]
        }]
      }
    });
  }

  loadBarChart() {
    new Chart("barChartCanvas", {
      type: 'bar',
      data: {
        labels: ['9–13', '14–18', '19–25', '26–50', '51+'],
        datasets: [{
          data: [16, 32, 16, 27, 9],
          backgroundColor: '#8d6597'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
}
