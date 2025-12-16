import { Component, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { ApiService } from '../Service/api.service';

Chart.register(...registerables);

@Component({
  selector: 'app-impact-metrics-charts',
  standalone: true,
  imports: [],
  templateUrl: './impact-metrics-charts.component.html',
  styleUrl: './impact-metrics-charts.component.scss'
})
export class ImpactMetricsChartsComponent {

  pieChart: any;
  barChart: any;

  dashboardData: any = null;

  constructor(
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.getDashboardData();
  }

  // ngAfterViewInit(): void {
  //   this.loadPieChart();
  //   this.loadBarChart();
  // }

  // loadPieChart() {
  //   new Chart("pieChartCanvas", {
  //     type: 'pie',
  //     data: {
  //       labels: [
  //         'Service Projects', 'Community Events', 'Food Rescues', 'NEST Tutors',
  //         'Notes of Kindness', 'Workshops', 'Donations', 'Other'
  //       ],
  //       datasets: [{
  //         data: [25.7, 13.2, 30.2, 7.2, 5.9, 3.8, 1.0, 13],
  //         backgroundColor: [
  //           '#6A5ACD', '#7EA4FF', '#8BC34A', '#FFF176',
  //           '#FF8A65', '#E57373', '#CE93D8', '#BDBDBD'
  //         ]
  //       }]
  //     },
  //     options: {
  //       plugins: {
  //         legend: { position: 'left' }
  //       }
  //     }
  //   });
  // }

  // loadBarChart() {
  //   new Chart("barChartCanvas", {
  //     type: 'bar',
  //     data: {
  //       labels: ['9–13', '14–18', '19–25', '26–50', '51+'],
  //       datasets: [{
  //         data: [16, 32, 16, 27, 9],
  //         backgroundColor: '#8d6597'
  //       }]
  //     },
  //     options: {
  //       scales: {
  //         y: { beginAtZero: true }
  //       }
  //     }
  //   });
  // }

  loadPieChart() {
    if (this.pieChart) this.pieChart.destroy(); // avoid duplicates

    this.pieChart = new Chart("pieChartCanvas", {
      type: 'pie',
      data: {
        labels: this.dashboardData.serviceCategories.labels,
        datasets: [{
          data: this.dashboardData.serviceCategories.data,
          backgroundColor: [
            '#6A5ACD', '#7EA4FF', '#8BC34A', '#FFF176',
            '#FF8A65', '#E57373', '#CE93D8', '#BDBDBD'
          ]
        }]
      },
      options: {
        plugins: {
          legend: { position: 'left' }
        }
      }
    });
  }

  loadBarChart() {
    if (this.barChart) this.barChart.destroy(); // avoid duplicates

    this.barChart = new Chart("barChartCanvas", {
      type: 'bar',
      data: {
        labels: this.dashboardData.ageDistribution.labels,
        datasets: [{
          label: "Volunteers",
          data: this.dashboardData.ageDistribution.data,
          backgroundColor: '#8d6597'
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }



  getDashboardData() {
    try {
      const authToken = localStorage.getItem("authToken");
      let token = {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }

      this.api.get('admin/analytics/dashboard', token).subscribe(res => {
        console.log('dashboard data: >>> ', res);
        this.dashboardData = res;
        this.loadPieChart();
        this.loadBarChart();
      })
    } catch (err) {
      console.log(err.message);
    }
  }


}
