import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { AuthenticationComponent } from '../authentication/authentication.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { SharedService } from '../Service/shared.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, AuthenticationComponent, DashboardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  constructor(private sharedService: SharedService) {}
}
