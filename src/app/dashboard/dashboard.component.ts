import { DatePipe, NgClass, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { SharedService } from '../Service/shared.service';
import { ApiService } from '../Service/api.service';
import { FormsModule, NgModel } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoaderComponent } from '../loader/loader.component';

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
  imports: [NgIf,NgFor,NgClass, DatePipe, TitleCasePipe, FormsModule, LoaderComponent],
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
  isAdmin = false; // toggle based on login
  today = new Date().toISOString().split('T')[0];

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

  constructor(private sharedService: SharedService, private api: ApiService) { }

  ngOnInit() {
    this.loadDashboardData();
  }
  

  loadDashboardData() {
    try{
      this.loader = true;
      const authToken = localStorage.getItem("authToken");
      let token = {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
      this.api.get('volunteers/dashboard', token).subscribe(res => {
        this.loader = false;
        console.log(res);
        this.dashboardData = res;
        this.calculateProgress();
        this.prepareStatCards();
      });
    }catch(err){
      this.loader = false;
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
    console.log('Submit hours clicked');
  }

  onExportData() {
    console.log('Export data clicked');
  }

  editHours(id: string) {
    console.log('Edit hours:', id);
  }

  showRejectionReason(reason: string) {
    alert('Rejection Reason: ' + reason);
  }










  // Modal Functions
  showSubmitHoursModal() { this.showSubmitModal = true; }
  hideSubmitHoursModal() { this.showSubmitModal = false; this.hours = {}; this.proofFile = null; }

  onFileSelected(event: any) { this.proofFile = event.target.files[0]; }

  // Submit Hours
  handleSubmitHours() {
    const formData = new FormData();
    Object.keys(this.hours).forEach(key => formData.append(key, this.hours[key]));
    if (this.proofFile) formData.append('proofOfService', this.proofFile);

    const headers = new HttpHeaders({ Authorization: `Bearer ${this.authToken}` });

    this.api.post(`${this.API_BASE}/hours/submit`, formData, { headers })
      .subscribe({
        next: () => {
          this.showMessage('Hours submitted successfully!', 'success');
          this.hideSubmitHoursModal();
          this.loadAdminPanel();
        },
        error: (err) => {
          this.showMessage(err.error?.message || 'Failed to submit hours', 'error');
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
    this.api.put(`${this.API_BASE}/admin/review-hours/${id}`, { status: 'approved' }, { headers })
      .subscribe(() => { this.showMessage('Hours approved!', 'success'); this.loadAdminPanel(); });
  }

  rejectHours(id: string) {
    const reason = prompt('Please provide a reason for rejection (optional):');
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.authToken}`, 'Content-Type': 'application/json' });
    this.api.put(`${this.API_BASE}/admin/review-hours/${id}`, { status: 'rejected', rejectionReason: reason }, { headers })
      .subscribe(() => { this.showMessage('Hours rejected!', 'success'); this.loadAdminPanel(); });
  }

  viewHourDetails(id: string) {
    alert(`Viewing details for: ${id}`); // you can expand with modal
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

}
