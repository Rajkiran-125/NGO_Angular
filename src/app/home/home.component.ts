import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { AuthenticationComponent } from '../authentication/authentication.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { SharedService } from '../Service/shared.service';
import { Observable } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, AuthenticationComponent, DashboardComponent, AsyncPipe, NgIf],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  isLoggedIn$: Observable<boolean>;
  constructor(private sharedService: SharedService) {
    this.isLoggedIn$ = this.sharedService.isLoggedIn$;
  }
}
