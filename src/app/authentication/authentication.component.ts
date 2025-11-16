import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../Service/api.service';
import { NgIf } from '@angular/common';
import { SharedService } from '../Service/shared.service';
import { LoaderComponent } from '../loader/loader.component';
import { TosterService } from '../Service/toster.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, LoaderComponent],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss'
})
export class AuthenticationComponent {

  loader: boolean = false;
  loginForm: any = FormGroup;
  signUpForm: any = FormGroup;
  loginPage: boolean = true;
  signUpPage: boolean = false;
  authPage: boolean = true;
  previewUrl: string | ArrayBuffer | null = null;
  changePassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private sharedService: SharedService,
    private toster: TosterService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.checkAuthStatus();

    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.signUpForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      userName: ['', Validators.required],
      password: ['', Validators.required],
      schoolOrOrganization: ['', Validators.required],
      dob: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      refCode: ['', Validators.required]
    });
  }

  login() {
    const email = this.loginForm.value.userName;
    const password = this.loginForm.value.password;
    
    if (this.loginForm.valid) {
      
      this.loader = true;

      this.api.post('auth/login', { email, password }).subscribe({
        next: (res: any) => {
          this.loader = false;
          console.log(res);
          this.toster.show("success", "Login successfully")
          const isAdmin = res.user.role == 'admin' ? true : false;

          const authToken = res.token;
          localStorage.setItem("authToken", authToken);

          this.loginPage = false;
          this.authPage = false;
          this.sharedService.login(authToken, isAdmin);

          this.loginForm.reset();
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.loader = false;
          console.error('Login failed', err);

          this.toster.show('error',err.error?.message);
        }
      });
    } else {
      this.loader = false;
      console.error('Form Invalid');

      this.toster.show('error','Form Invalid');
    }
  }


  signUp() {
    try {
      this.loader = true;
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
        this.loader = false;
        console.log(res);
        this.toster.show('success', 'SignUp successfully');
        this.router.navigate(['/login']);
      })
    } catch (err) {
      this.loader = false;
      this.toster.show('error', err.error?.message);
      console.log(err);
    }
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
          // this.sharedService.updateDashboardPage(true);
        })
      } catch (err) {
        this.toster.show('error', err.error?.message);
        console.log(err.message);
      }
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result);
      reader.readAsDataURL(file);
    }
  }

}
