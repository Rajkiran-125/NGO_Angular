import { Component } from '@angular/core';
import { SharedService } from '../Service/shared.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  authToken:any;

  constructor(
    private sharedService: SharedService,
  ){}

  ngOnInit() {
    this.authToken = localStorage.getItem("authToken");
  }

  logout(){
    localStorage.removeItem("authToken");
    this.sharedService.updateDashboardPage(false);
    this.sharedService.updateLoginPage(true);
  }
}
