import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private loggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.loggedIn.asObservable();

  private isAdmin = new BehaviorSubject<boolean>(false);
  isAdmin$ = this.isAdmin.asObservable();

  constructor() {
    // 👇 check localStorage on load
    const token = localStorage.getItem('authToken');
    if (token) {
      this.loggedIn.next(true);
    }
  }

  login(token: string, isAdmin) {
    localStorage.setItem('authToken', token);
    this.loggedIn.next(true);
    this.isAdmin.next(isAdmin);
    if(isAdmin){
      localStorage.setItem('user', "admin");
    }else{
      localStorage.setItem('user', "volunteer");
    }
  }

  logout() {
    this.loggedIn.next(false);
  }

}
