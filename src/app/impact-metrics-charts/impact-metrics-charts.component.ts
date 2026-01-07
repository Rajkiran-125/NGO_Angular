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

  // loadPieChart() {
  //   if (this.pieChart) this.pieChart.destroy(); // avoid duplicates

  //   this.pieChart = new Chart("pieChartCanvas", {
  //     type: 'pie',
  //     data: {
  //       labels: this.dashboardData.serviceCategories.labels,
  //       // labels: [
  // //         'Service Projects', 'Community Events', 'Food Rescues', 'NEST Tutors',
  // //         'Notes of Kindness', 'Workshops', 'Donations', 'Other'
  // //       ],
  //       datasets: [{
  //         data: this.dashboardData.serviceCategories.data,
  //         backgroundColor: [
  //           '#8d77ab', '#656a97', '#8d9765', '#5a0f8d', '#fff8bd',
  //           '#ffdac3', '#d86464', '#c4a092', '#d8a4d3'
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

  loadPieChart() {
    if (this.pieChart) this.pieChart.destroy();

    this.pieChart = new Chart("pieChartCanvas", {
      type: 'pie',
      data: {
        labels: this.dashboardData.serviceCategories.labels,
        datasets: [{
          data: this.dashboardData.serviceCategories.data,
          backgroundColor: [
            '#1E88E5', '#FB8C00', '#43A047', '#E53935', '#8E24AA',
            '#00ACC1', '#FDD835', '#D81B60', '#7CB342'
          ]
          // backgroundColor: [
          //   '#8d77ab', '#656a97', '#8d9765', '#5a0f8d', '#fff8bd',
          //   '#ffdac3', '#d86464', '#c4a092', '#d8a4d3'
          // ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,

        animation: false, // ⭐ IMPORTANT FIX

        interaction: {
          mode: 'index',   // ⭐ fixes hover offset
          intersect: true
        },

        plugins: {
          legend: {
            position: 'left'
          },
          tooltip: {
            enabled: true
          }
        }
      }
    });
  }


  // loadBarChart() {
  //   if (this.barChart) this.barChart.destroy(); // avoid duplicates

  //   this.barChart = new Chart("barChartCanvas", {
  //     type: 'bar',
  //     data: {
  //       labels: this.dashboardData.ageDistribution.labels,
  //       datasets: [{
  //         label: "Volunteers",
  //         data: this.dashboardData.ageDistribution.data,
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


  loadBarChart() {
  if (this.barChart) this.barChart.destroy();

  this.barChart = new Chart("barChartCanvas", {
    type: 'bar',
    data: {
      labels: this.dashboardData.ageDistribution.labels,
      datasets: [{
        label: "Volunteers",
        data: this.dashboardData.ageDistribution.data,
        backgroundColor: '#8d6597',
        barPercentage: 0.7,
        categoryPercentage: 0.7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      animation: false, // ⭐ critical fix

      interaction: {
        mode: 'index',  // ⭐ correct bar mapping
        intersect: true
      },

      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        },
        x: {
          grid: { display: false }
        }
      },

      plugins: {
        tooltip: {
          enabled: true
        },
        legend: {
          display: true
        }
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
