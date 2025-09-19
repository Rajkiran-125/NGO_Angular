import { Component } from '@angular/core';
import { SharedService } from '../Service/shared.service';
import { AsyncPipe, NgIf } from '@angular/common';
import { Observable } from 'rxjs';

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
  ){
     this.isLoggedIn$ = this.sharedService.isLoggedIn$;
  }

  ngOnInit() {
    this.authToken = localStorage.getItem("authToken");
  }

  logout() {
    this.sharedService.logout();
  }
}
