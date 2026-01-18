import { Component, HostListener } from '@angular/core';
import { SharedService } from '../Service/shared.service';
import { AsyncPipe, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { TosterService } from '../Service/toster.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ApiService } from '../Service/api.service';
import { environment } from '../../environments/environment';

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
  isAdmin: any;
  mobileMenuOpen = false;
  previewUrl: string | null = null;
  fileBaseUrl = environment.fileBaseUrl;


  constructor(
    private sharedService: SharedService,
    private toster: TosterService,
    private router: Router,
    private api: ApiService,
  ) {
    this.isLoggedIn$ = this.sharedService.isLoggedIn$;
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });
    this.isAdmin = this.sharedService.isAdmin$;
  }

  ngOnInit() {
    this.authToken = localStorage.getItem("authToken");
    this.menuOpen = false;
    this.mobileMenuOpen = false;
    // this.isAdmin = this.sharedService.isAdmin$;
    this.sharedService.isAdmin$.subscribe(value => {
      this.isAdmin = value;
    });
    this.isAdmin = localStorage.getItem('user') == 'admin' ? true : false;
    this.loadProfileData();
  }

  loadProfileData() {
    try {
      const authToken = localStorage.getItem("authToken");
      const token = {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      };

      this.api.get('volunteers/profile', token).subscribe({
        next: (res: any) => {
          const user = res.user;
          this.previewUrl = user.profile.profilePicture;
        },
        error: (err) => {
          this.toster.show("error", err.message);
        }
      });
    } catch (err) {
      this.toster.show("error", err.message);
    }
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
    this.mobileMenuOpen = false;
    // this.router.navigate(['/profile']);
    console.log('Navigating to profile...');
    this.router.navigate(['/profile']).then(success => console.log('Navigation result:', success));
  }

  showDashboard() {
    this.menuOpen = false;
    this.mobileMenuOpen = false;
    this.router.navigate(['/home']);
  }

  changePassword() {
    // this.sharedService.setShowChangePassword(true);

    this.menuOpen = false; // optional, close the menu
    this.mobileMenuOpen = false;
    this.router.navigate(['/changepassword']);
  }
  tierBreakdown() {
    this.menuOpen = false; // optional, close the menu
    this.mobileMenuOpen = false;
    this.router.navigate(['/tierbreakdown']);
  }
  impactMetrics() {
    this.menuOpen = false;
    this.mobileMenuOpen = false;
    this.router.navigate(['chart']);
  }
  routeDashboard(){
    this.router.navigate(['/home']);
  }

  logout() {
    this.menuOpen = false;
    this.mobileMenuOpen = false;
    const user = localStorage.getItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    this.sharedService.logout();
    this.toster.show("success", "Logout");
    if (user == 'volunteer') {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/adminlogin']);
    }
  }

}
