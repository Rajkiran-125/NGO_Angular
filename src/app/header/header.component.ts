import { Component } from '@angular/core';
import { SharedService } from '../Service/shared.service';
import { AsyncPipe, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { TosterService } from '../Service/toster.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf, AsyncPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  authToken:any;
  isLoggedIn$: Observable<boolean>;

  constructor(
    private sharedService: SharedService,
    private toster: TosterService
  ){
     this.isLoggedIn$ = this.sharedService.isLoggedIn$;
  }

  ngOnInit() {
    this.authToken = localStorage.getItem("authToken");
  }

  logout() {
    localStorage.removeItem('authToken');
    this.sharedService.logout();
    this.toster.show("success", "Logout");
  }
}
