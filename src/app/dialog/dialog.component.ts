import { ChangeDetectionStrategy, Component, Inject, ChangeDetectorRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { NgIf, DatePipe, NgFor } from '@angular/common';
import html2pdf from 'html2pdf.js';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SharedService } from '../Service/shared.service';
import { ApiService } from '../Service/api.service';
import { TosterService } from '../Service/toster.service';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatButtonModule, MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    NgIf,
    NgFor,
    DatePipe,
    MatTabsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {

  badge: any;
  type: any;

  fromDate: Date;
  toDate: Date;
  pdfExportData: any;
  authToken = localStorage.getItem('authToken');
  showPdf: boolean = false;

  selectedTab = 0; // default: Single Date

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sharedService: SharedService,
    private api: ApiService,
    private toster: TosterService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.badge = this.data.badge;
    this.type = this.data.type;

    console.log('Badge:', this.badge);
    console.log('Type:', this.type);
  }

  closeDialog() {
    // You can send any data back — for example, both dates
    const returnData = {
      fromDate: this.fromDate,
      toDate: this.toDate,
      type: this.data.type // optional, if you passed 'type' in
    };

    this.dialogRef.close(returnData);
  }

  downloadBadge(badgeName: string) {
    // Encode and build path
    const badgePath = `assets/Image/badge/kindness_Ambassador.png`;

    // 1️⃣ Open in a new tab for preview
    const newTab = window.open(badgePath, '_blank');

    // // 2️⃣ Wait a bit (to allow browser to open), then trigger download
    // setTimeout(() => {
    //   const link = document.createElement('a');
    //   link.href = badgePath;
    //   link.download = `${badgeName}.png`;
    //   document.body.appendChild(link);
    //   link.click();
    //   document.body.removeChild(link);
    // }, 1000); // 1 second delay (can adjust)
  }

  formatDate(date: Date) {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  downloadPDF(type) {

    console.log('fromDate', this.fromDate);
    console.log('toDate', this.toDate);

    let obj: any = {};

    if (type === 'submitSingle') {
      const selected = this.formatDate(this.fromDate);
      obj = {
        fromDate: selected
      };
    }

    else if (type === 'submitRange') {
      obj = {
        fromDate: this.formatDate(this.fromDate),
        toDate: this.formatDate(this.toDate)
      };
    }

    console.log("Final OBJ:", obj);

    const headers = new HttpHeaders({ Authorization: `Bearer ${this.authToken}` });
    // this.api.get(`hours/export?format=json`, { headers }).subscribe(res => {
    this.api.post(`volunteers/hours/export`, obj, { headers }).subscribe(res => {
      console.log(res);

      this.pdfExportData = res;

      // 2. Force Angular to re-render DOM
      this.cdr.detectChanges();

      // 3. Wait for DOM + images + table to fully render
      requestAnimationFrame(() => {
        // setTimeout(() => {

        const element = document.getElementById('pdfContent');

        console.log("PDF Content:", element?.innerHTML); // Debugging

        if (!element) return;

        // 4. PDF Options
        const opt = {
          margin: 0.5,
          filename: 'Volunteer_Report.pdf',
          image: { type: 'jpeg', quality: 1 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        // 5. Generate PDF
        (html2pdf as any)()
          .from(element)
          .set(opt)
          .save();


        this.dialogRef.close();

        // }, 300);  // allow table + images to render fully
      });



    });
  }
}
