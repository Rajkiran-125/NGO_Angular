import { AsyncPipe, DatePipe, JsonPipe, NgClass, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Component, ChangeDetectionStrategy, inject, HostListener } from '@angular/core';
import { SharedService } from '../Service/shared.service';
import { ApiService } from '../Service/api.service';
import { FormsModule, NgModel } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoaderComponent } from '../loader/loader.component';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { TosterService } from '../Service/toster.service';
import { FooterComponent } from '../footer/footer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Dialog } from '@angular/cdk/dialog';
import { DialogComponent } from '../dialog/dialog.component';

import html2pdf from 'html2pdf.js';
import { SearchFilterPipe } from '../search-filter.pipe';


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
  imports: [NgIf,
    NgFor, NgClass, DatePipe, TitleCasePipe, FormsModule, LoaderComponent, AsyncPipe,
    JsonPipe, FooterComponent, MatButtonModule, MatDialogModule, DialogComponent,
    SearchFilterPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  readonly dialog = inject(MatDialog);
  loader: boolean = false;
  API_BASE = 'http://localhost:3000/api';
  authToken = localStorage.getItem('authToken');
  dashboardData!: DashboardData;
  progressInfo: any;
  statusFilter: string = '';

  statCards: any[] = [];
  statCardsAdmin: any[] = [];
  dashboardPage: boolean = false;

  showSubmitModal = false;
  // isAdmin$ : Observable<boolean>; // toggle based on login
  isAdmin: any; // toggle based on login
  today = new Date().toISOString().split('T')[0];
  isLoading = false;
  pdfExportData: any;
  adminCardsData: any;
  searchBy: string = 'activityName';
  searchText: string = '';
  searchType: string = '';
  dropdownOpen = false;
  displayLabel: string = 'Select Filter';

  hours: any = {
    fullName: '',
    // schoolOrganization: '',
    activityName: '',
    serviceDate: '',
    hours: '',
    serviceType: '',
    description: '',
    isHistorical: false
  };
  proofFile: File | null = null;

  serviceTypes = [
    'NEST4US Service Projects', 'NEST4US Community Events', 'NEST4US Food Rescues',
    'NEST4US Tutors', 'NEST4US Notes of Kindness', 'NEST4US Workshops', 'NEST4US Donations', "Others"
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
      this.loadAdminCards();
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectFilter(type: string, label: string) {
    this.searchType = type;
    this.displayLabel = label;
    this.dropdownOpen = false;
  }

  // 🔥 CLOSE DROPDOWN ON CLICK OUTSIDE
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;

    // If click is outside the dropdown, close it
    if (!target.closest('.dropdown')) {
      this.dropdownOpen = false;
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
        this.loadAdminPanel();
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
        this.loadAdminPanel();
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
        label: 'Lifetime Hours',
        value: this.dashboardData?.totalHours || 0,
      },
      {
        icon: 'fas fa-dollar-sign',
        label: 'Value of Service',
        // value: `$${this.dashboardData.valueOfService || '0.00'}`,
        value: `$${(this.dashboardData?.totalHours * 34.79)}`,
      },
      {
        icon: 'fas fa-calendar',
        label: 'Current Year',
        value: this.dashboardData?.thisYearHours || 0,
      },
      {
        icon: 'fas fa-award',
        label: 'Recognition Tier',
        value: this.dashboardData?.tier || 'N/A',
      },
    ],
      this.statCardsAdmin = [
        {
          icon: 'fa-solid fa-heart',
          label: 'Total Volunteers',
          value: this.adminCardsData?.totalVolunteers || 0,
        },
        {
          icon: 'fa-solid fa-clock',
          label: 'Total Hours',
          // value: `$${this.dashboardData.valueOfService || '0.00'}`,
          value: this.adminCardsData?.totalHours || 0,
        },
        {
          icon: 'fas fa-dollar-sign',
          label: 'Value of Service',
          value: this.adminCardsData?.valueOfService || '0.00',
        },
        {
          icon: 'fa-solid fa-clipboard-list',
          label: 'Pending Submissions',
          value: this.adminCardsData?.pendingSubmissions || 'N/A',
        },
      ];
  }

  loadAdminCards() {
    try {
      const authToken = localStorage.getItem("authToken");
      let token = {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
      this.api.get('admin/summary', token).subscribe(res => {
        console.log(res);
        this.adminCardsData = res?.summary;
        this.prepareStatCards();
      })
    } catch (err) {
      console.log(err.message);
    }
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
    const entry = this.pendingHours.find(e => e._id === id);
    console.log(entry)
    if (entry) {
      // 2. Populate hours object
      this.hours = {
        fullName: entry.fullName,
        activityName: entry.activityName,
        serviceDate: entry.serviceDate ? entry.serviceDate.split('T')[0] : '', // keep YYYY-MM-DD
        hours: entry.hours,
        serviceType: entry.serviceType,
        description: entry.description,
        isHistorical: entry.isHistorical || false,
        id: id
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

    console.log('__');
    console.log('this.pendingHours : ', this.pendingHours)
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

      const type = 'exportDate'
      const badge = '';
      const dialogRef = this.dialog.open(DialogComponent, {
        data: { badge, type }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('Dialog closed with data:', result);
          // example: access the returned data
          console.log('From:', result.fromDate);
          console.log('To:', result.toDate);
          console.log('Type:', result.type);
        }
      });

      if (false) {

        let obj = {
          "fromDate": "2024-01-03",
          "toDate": "2025-11-08"
        }
        const headers = new HttpHeaders({ Authorization: `Bearer ${this.authToken}` });
        // this.api.get(`hours/export?format=json`, { headers }).subscribe(res => {
        this.api.post(`volunteers/hours/export`, obj, { headers }).subscribe(res => {
          console.log(res);

          // 1. Convert JSON to worksheet
          // const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(res);

          // // 2. Create a workbook
          // const workbook: XLSX.WorkBook = {
          //   Sheets: { 'Volunteer Hours': worksheet },
          //   SheetNames: ['Volunteer Hours']
          // };

          // // 3. Generate Excel file buffer
          // const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

          // // 4. Save as file
          // const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
          // saveAs(data, `volunteer_hours_${new Date().toISOString().slice(0, 10)
          //   }.xlsx`);
          // this.toster.show('success', 'File exported')
        });
      }

    } catch (error) {
      this.toster.show('error', error.error?.message)
      console.log(error);
    }
  }




  openDialog(badge) {
    const type = 'badge'
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { badge, type }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

}
