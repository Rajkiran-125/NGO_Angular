import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../Service/api.service';
import { NgIf } from '@angular/common';
import { SharedService } from '../Service/shared.service';
// import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss'
})
export class AuthenticationComponent {

  loginForm: any = FormGroup;
  signUpForm: any = FormGroup;
  loginPage: boolean = true;
  signUpPage: boolean = false;
  authPage: boolean = true;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {

    this.checkAuthStatus();

    this.sharedService.loginMessage$.subscribe(val => {
      // this.loginPage = val;
      // this.authPage = val;
    });

    this.loginForm = this.fb.group({
      userName: [],
      password: []
    });

    this.signUpForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [],
      email: [],
      userName: [],
      password: [],
      schoolOrOrganization: [],
      dob: [],
      phoneNumber: [],
      state: [],
      country: [],
      refCode: ['']
    });
  }

  login() {
    const email = this.loginForm.value.userName;
    const password = this.loginForm.value.password;

    this.api.post('auth/login', { email, password }).subscribe(res => {
      console.log(res);
      const authToken = res.token;
      localStorage.setItem("authToken", authToken);
      this.loginPage = false;
      this.authPage = false;
      this.sharedService.updateDashboardPage(true);
      this.loginForm.reset();
    })
  }

  signUp() {
    let formData = {
      firstName: this.signUpForm.value.firstName,
      lastName: this.signUpForm.value.lastName,
      email: this.signUpForm.value.email,
      password: this.signUpForm.value.password,
      schoolOrganization: this.signUpForm.value.schoolOrOrganization,
      dateOfBirth: this.signUpForm.value.dob,
      phoneNumber: this.signUpForm.value.phoneNumber,
      location: {
        state: this.signUpForm.value.state,
        country: this.signUpForm.value.country,
      },
      referredBy: this.signUpForm.value.refCode,
    };

    this.api.post('auth/register', formData).subscribe(res => {
      console.log(res);
    })
  }

  logout() {
    localStorage.removeItem("authToken");
  }

  checkAuthStatus() {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      try {
        let obj = {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
        this.api.get('volunteers/dashboard', obj).subscribe(res => {
          console.log(res);
          this.loginPage = false;
          this.authPage = false;
          this.sharedService.updateDashboardPage(true);
        })
      } catch (err) {
        console.log(err.message);
      }
    }
  }

}
