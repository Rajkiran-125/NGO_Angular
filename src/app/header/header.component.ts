import { Component, HostListener } from '@angular/core';
import { SharedService } from '../Service/shared.service';
import { AsyncPipe, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { TosterService } from '../Service/toster.service';
import { Router, NavigationEnd  } from '@angular/router';
import { filter } from 'rxjs/operators';

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
  currentRoute: string = '';


  constructor(
    private sharedService: SharedService,
    private toster: TosterService,
    private router: Router
  ) {
    this.isLoggedIn$ = this.sharedService.isLoggedIn$;
     this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });
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
    // this.router.navigate(['/profile']);
    console.log('Navigating to profile...');
    this.router.navigate(['/profile']).then(success => console.log('Navigation result:', success));
  }

  showDashboard(){
    this.menuOpen = false;
    this.router.navigate(['/home']);
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
