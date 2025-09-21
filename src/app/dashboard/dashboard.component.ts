import { AsyncPipe, DatePipe, JsonPipe, NgClass, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { SharedService } from '../Service/shared.service';
import { ApiService } from '../Service/api.service';
import { FormsModule, NgModel } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoaderComponent } from '../loader/loader.component';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { TosterService } from '../Service/toster.service';

interface DashboardData {
  profile: { firstName: string; lastName: string; schoolOrganization: string };
  totalHours: number;
  thisYearHours: number;
  tier: string;
  referralCode: string;
  badges: string[];
  hoursHistory: any[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, DatePipe, TitleCasePipe, FormsModule, LoaderComponent, AsyncPipe, JsonPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  loader: boolean = false;
  API_BASE = 'http://localhost:3000/api';
  authToken = localStorage.getItem('authToken');
  dashboardData!: DashboardData;
  progressInfo: any;
  statusFilter: string = '';

  statCards: any[] = []; dashboardPage: boolean = false;

  showSubmitModal = false;
  // isAdmin$ : Observable<boolean>; // toggle based on login
  isAdmin: any; // toggle based on login
  today = new Date().toISOString().split('T')[0];
  isLoading = false;

  hours: any = {
    firstName: '',
    lastName: '',
    schoolOrganization: '',
    activityName: '',
    serviceDate: '',
    hours: '',
    serviceType: '',
    description: '',
    isHistorical: false
  };
  proofFile: File | null = null;

  serviceTypes = [
    'Service Projects', 'Community Events', 'Food Rescues',
    'NEST Tutors', 'Notes of Kindness', 'Workshops', 'Donations', 'Other'
  ];

  adminStats = { totalVolunteers: 0, totalHours: 0, pendingSubmissions: 0 };
  pendingHours: any[] = [];

  constructor(
    private sharedService: SharedService,
    private api: ApiService,
    private toster: TosterService
  ) {
    this.isAdmin = this.sharedService.isAdmin$;
  }

  ngOnInit() {
    this.loadDashboardData();
    this.isAdmin = localStorage.getItem('user') == 'admin' ? true : false;
    if (this.isAdmin) {
      this.loadAdminPanel();
    }
  }


  loadDashboardData() {
    try {
      const authToken = localStorage.getItem("authToken");
      let token = {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
      this.api.get('volunteers/dashboard', token).subscribe(res => {
        console.log(res);
        this.dashboardData = res;
        this.calculateProgress();
        this.prepareStatCards();
      });
    } catch (err) {
      // this.loader = false;
      this.toster.show("error", err.message);
      console.log(err);
    }
  }
  loadDashboardDataRefresh() {
    try {
      this.isLoading = true;
      const authToken = localStorage.getItem("authToken");
      let token = {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
      this.api.get('volunteers/dashboard', token).subscribe(res => {
        setTimeout(() => {
          this.isLoading = false;
        }, 500);
        // this.toster.show('success', 'Dashboard data refresh');
        console.log(res);
        this.dashboardData = res;
        this.calculateProgress();
        this.prepareStatCards();
      });
    } catch (err) {
      // this.loader = false;
      this.toster.show("error", err.message);
      console.log(err);
    }
  }

  prepareStatCards() {
    this.statCards = [
      {
        icon: 'fas fa-clock',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600',
        label: 'Total Hours',
        value: this.dashboardData.totalHours,
      },
      {
        icon: 'fas fa-calendar',
        bgColor: 'bg-green-100',
        textColor: 'text-green-600',
        label: 'This Year',
        value: this.dashboardData.thisYearHours,
      },
      {
        icon: 'fas fa-medal',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-600',
        label: 'Current Tier',
        value: this.dashboardData.tier,
      },
      {
        icon: 'fas fa-share',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-600',
        label: 'Referral Code',
        value: this.dashboardData.referralCode,
      },
    ];
  }

  calculateProgress() {
    const tiers = [
      { name: 'Kindness Ambassador', hours: 50 },
      { name: 'Change Catalyst', hours: 100 },
      { name: 'Service Champion', hours: 150 },
      { name: 'Legacy Leader', hours: 250 },
    ];

    const totalHours = this.dashboardData.totalHours;
    const nextTier = tiers.find((t) => totalHours < t.hours);

    if (!nextTier) {
      this.progressInfo = null; // Already max tier
      return;
    }

    const progress = (totalHours / nextTier.hours) * 100;
    const remaining = nextTier.hours - totalHours;

    this.progressInfo = { nextTier, progress, remaining };
  }

  get filteredHistory() {
    if (!this.dashboardData?.hoursHistory) return [];
    return this.statusFilter
      ? this.dashboardData.hoursHistory.filter(
        (h) => h.status === this.statusFilter
      )
      : this.dashboardData.hoursHistory;
  }

  statusClass(status: string) {
    return {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }[status];
  }

  statusIcon(status: string) {
    return {
      pending: 'fas fa-clock',
      approved: 'fas fa-check-circle',
      rejected: 'fas fa-times-circle',
    }[status];
  }

  onSubmitHours() {
    this.showSubmitModal = true;
    console.log('Submit hours clicked');
  }

  onExportData() {
    console.log('Export data clicked');
  }

  editHours(id: string) {
    console.log(this.dashboardData)
    const entry = this.pendingHours.find(e => e.id === id);


    if (entry) {
      // 2. Populate hours object
      this.hours = {
        firstName: entry.volunteerId.profile.firstName,
        lastName: entry.volunteerId.profile.lastName,
        schoolOrganization: entry.volunteerId.profile.schoolOrganization,
        activityName: entry.activityName,
        serviceDate: entry.serviceDate ? entry.serviceDate.split('T')[0] : '', // keep YYYY-MM-DD
        hours: entry.hours,
        serviceType: entry.serviceType,
        description: entry.description,
        isHistorical: entry.isHistorical || false
      };

      // 3. Track edit state
      // this.isEditMode = true;
      // this.editingId = entry.id;

      // 4. Show modal
      this.showSubmitModal = true;
    }
  }

  showRejectionReason(reason: string) {
    this.toster.show('info', `Rejection Reason: ${reason}`);
  }










  // Modal Functions
  hideSubmitHoursModal() { this.showSubmitModal = false; this.hours = {}; this.proofFile = null; }

  onFileSelected(event: any) { this.proofFile = event.target.files[0]; }

  // Submit Hours
  handleSubmitHours() {
    const formData = new FormData();
    Object.keys(this.hours).forEach(key => formData.append(key, this.hours[key]));
    if (this.proofFile) formData.append('proofOfService', this.proofFile);

    const headers = new HttpHeaders({ Authorization: `Bearer ${this.authToken}` });

    this.api.post(`hours/submit`, formData, { headers })
      .subscribe({
        next: () => {
          // this.showMessage('Hours submitted successfully!', 'success');
          this.hideSubmitHoursModal();
          this.loadAdminPanel();
          this.loadDashboardData();
        },
        error: (err) => {
          this.toster.show('error', err.error?.message || 'Failed to submit hours');
          // this.showMessage(err.error?.message || 'Failed to submit hours', 'error');
        }
      });
  }

  // Admin Panel
  loadAdminPanel() {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.authToken}` });

    this.api.get(`admin/stats`, { headers }).subscribe(stats => this.adminStats = stats);
    this.api.get(`admin/pending-hours`, { headers }).subscribe(data => this.pendingHours = data);
  }

  approveHours(id: string) {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.authToken}`, 'Content-Type': 'application/json' });
    this.api.put(`admin/review-hours/${id}`, { status: 'approved' }, { headers }).subscribe((res) => {
      console.log(res);
      this.toster.show('info', 'Hours approved!');
      this.loadAdminPanel();
    });
  }

  rejectHours(id: string) {
    const reason = prompt('Please provide a reason for rejection (optional):');
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.authToken}`, 'Content-Type': 'application/json' });
    this.api.put(`admin/review-hours/${id}`, { status: 'rejected', rejectionReason: reason }, { headers }).subscribe((res) => {
      console.log(res)
      this.toster.show('info', 'Hours rejected!');
      this.loadAdminPanel();
    });
  }

  viewHourDetails(id: string) {
    this.toster.show('info', `Viewing details for: ${id}`)
  }

  // Message utility
  showMessage(message: string, type: 'success' | 'error') {
    const container = document.getElementById('messageContainer');
    if (!container) return;

    const div = document.createElement('div');
    div.className = `${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-4 rounded-lg shadow-lg mb-4 relative`;
    div.innerHTML = `<span>${message}</span>
      <button class="absolute top-2 right-2" (click)="div.remove()">×</button>`;

    container.appendChild(div);
    setTimeout(() => div.remove(), 5000);
  }


  exportVolunteerData() {
    try {

      const headers = new HttpHeaders({ Authorization: `Bearer ${this.authToken}` });
      this.api.get(`hours/export?format=json`, { headers }).subscribe(res => {
        console.log(res);

        // 1. Convert JSON to worksheet
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(res);

        // 2. Create a workbook
        const workbook: XLSX.WorkBook = {
          Sheets: { 'Volunteer Hours': worksheet },
          SheetNames: ['Volunteer Hours']
        };

        // 3. Generate Excel file buffer
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        // 4. Save as file
        const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, `volunteer_hours_${new Date().toISOString().slice(0, 10)
          }.xlsx`);
        this.toster.show('success', 'File exported')
      });

    } catch (error) {
      this.toster.show('error', error.error?.message)
      console.log(error);
    }
  }



}
