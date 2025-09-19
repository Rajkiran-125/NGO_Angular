import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor() { }

  private dashboardPage = new BehaviorSubject<boolean>(false);  // default value
  currentMessage$ = this.dashboardPage.asObservable(); // expose as Observable

  private loginPage = new BehaviorSubject<boolean>(false);  // default value
  loginMessage$ = this.loginPage.asObservable();// expose as Observable

  updateLoginPage(val:boolean){
    this.loginPage.next(val);
  }

  updateDashboardPage(val: boolean) {
    this.dashboardPage.next(val);
  }
}
