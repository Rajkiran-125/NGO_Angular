import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private loggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor() {
    // 👇 check localStorage on load
    const token = localStorage.getItem('authToken');
    if (token) {
      this.loggedIn.next(true);
    }
  }

  login(token: string) {
    localStorage.setItem('authToken', token);
    this.loggedIn.next(true);
  }

  logout() {
    localStorage.removeItem('authToken');
    this.loggedIn.next(false);
  }
}
