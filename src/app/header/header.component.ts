import { Component, HostListener  } from '@angular/core';
import { SharedService } from '../Service/shared.service';
import { AsyncPipe, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { TosterService } from '../Service/toster.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf, AsyncPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  authToken: any;
  isLoggedIn$: Observable<boolean>;
  menuOpen = false;

  constructor(
    private sharedService: SharedService,
    private toster: TosterService,
    private router: Router
  ) {
    this.isLoggedIn$ = this.sharedService.isLoggedIn$;
  }

  ngOnInit() {
    this.authToken = localStorage.getItem("authToken");
    this.menuOpen = false;
  }


  // ✅ Close menu when clicking outside
  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.custom-dropdown');
    if (dropdown && !dropdown.contains(target)) {
      this.menuOpen = false;
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  openProfile() {
    this.menuOpen = false;
    this.router.navigate(['/profile']);
  }

  changePassword() {
    this.sharedService.setShowChangePassword(true);
    this.menuOpen = false; // optional, close the menu
  }

  logout() {
    localStorage.removeItem('authToken');
    this.sharedService.logout();
    this.toster.show("success", "Logout");
  }

}
