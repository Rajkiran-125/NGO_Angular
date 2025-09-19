import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { SharedService } from '../Service/shared.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  dashboardPage: boolean = false;
  constructor(private sharedService: SharedService) { }

  ngOnInit() {
    this.sharedService.currentMessage$.subscribe(val => {
      this.dashboardPage = val;
    });
  }
}
