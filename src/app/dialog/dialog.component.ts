import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatButtonModule, MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    NgIf
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

  // downloadBadge(badge) {
  //   window.open('assets/badge/Change%20Catalyst.png', '_blank');
  // }

  downloadBadge(badgeName: string) {
    // Create the path to the badge inside assets
    const badgePath = `assets/Image/badge/kindness_Ambassador.png`;

    // Create a hidden <a> element
    const link = document.createElement('a');
    link.href = badgePath;
    link.download = `${badgeName}.png`; // sets the filename for download
    link.target = '_blank'; // optional, opens in new tab if download fails

    // Trigger the click programmatically
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
  }

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
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
}
