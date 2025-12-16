import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../Service/api.service';
import { NgClass, NgIf } from '@angular/common';
import { SharedService } from '../Service/shared.service';
import { LoaderComponent } from '../loader/loader.component';
import { TosterService } from '../Service/toster.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, LoaderComponent, NgClass],
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
  profileUploadPic:File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  changePassword: boolean = false;
  // uploadPic:boolean = false;
  showPassword = false;


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


    // this.signUpForm = this.fb.group({
    //   fullName: ['', Validators.required],
    //   // lastName: ['', Validators.required],
    //   email: ['', Validators.required],
    //   userName: ['', Validators.required],
    //   password: ['', Validators.required],
    //   schoolOrOrganization: ['', Validators.required],
    //   dob: ['', Validators.required],
    //   phoneNumber: ['', Validators.required],
    //   state: ['', Validators.required],
    //   country: ['', Validators.required],
    //   refCode: ['', Validators.required]
    // });

    this.signUpForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      // userName: ['', Validators.required],
      password: ['', Validators.required],
      schoolOrOrganization: ['', Validators.required],
      dob: ['', Validators.required],
      phoneNumber: ['', Validators.required],

      state: ['', Validators.required],
      country: ['', Validators.required],

      // refCode: ['', Validators.required],
      interests: [''],
      // bio: [''],

      profilePhoto: [null]
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

          this.toster.show('error', err.error?.message);
        }
      });
    } else {
      this.loader = false;
      console.error('Form Invalid');

      this.toster.show('error', 'Form Invalid');
    }
  }


  // signUp() {
  //   try {
  //     this.loader = true;
  //     let formData = {
  //       fullName: this.signUpForm.value.fullName,
  //       // lastName: this.signUpForm.value.lastName,
  //       email: this.signUpForm.value.email,
  //       password: this.signUpForm.value.password,
  //       schoolOrganization: this.signUpForm.value.schoolOrOrganization,
  //       dateOfBirth: this.signUpForm.value.dob,
  //       phoneNumber: this.signUpForm.value.phoneNumber,
  //       location: {
  //         state: this.signUpForm.value.state,
  //         country: this.signUpForm.value.country,
  //       },
  //       referredBy: this.signUpForm.value.refCode,
  //     };

  //     this.api.post('auth/register', formData).subscribe(res => {
  //       this.loader = false;
  //       console.log(res);
  //       this.toster.show('success', 'SignUp successfully');
  //       this.router.navigate(['/login']);
  //     })
  //   } catch (err) {
  //     this.loader = false;
  //     this.toster.show('error', err.error?.message);
  //     console.log(err);
  //   }
  // }


  // signUp() {
  //   if (this.signUpForm.invalid) {
  //     this.toster.show('error', 'Please fill all required fields.');
  //     return;
  //   }

  //   this.loader = true;

  //   const formData = {
  //     fullName: this.signUpForm.value.fullName,//
  //     email: this.signUpForm.value.email,//
  //     // userName: this.signUpForm.value.userName,
  //     password: this.signUpForm.value.password,//
  //     schoolOrganization: this.signUpForm.value.schoolOrOrganization,//
  //     dateOfBirth: this.signUpForm.value.dob,//
  //     phoneNumber: this.signUpForm.value.phoneNumber,//

  //     location: {
  //       state: this.signUpForm.value.state,
  //       country: this.signUpForm.value.country
  //     },

  //     referredBy: "",
  //     causesOfInterest: this.signUpForm.value.interests, //
  //     // bio: this.signUpForm.value.bio
  //     profilePicture: this.profileUploadPic //
  //   };

  //   this.api.post('auth/register', formData, '').subscribe({
  //     next: (res) => {
  //       this.loader = false;
  //       this.toster.show('success', 'Account created successfully!');
  //       this.router.navigate(['/login']);
  //       this.loginPage = true;
  //     },
  //     error: (err) => {
  //       this.loader = false;
  //       this.toster.show('error', err.error?.message || 'Signup failed');
  //       console.error(err);
  //     }
  //   });
  // }

  signUp() {
  if (this.signUpForm.invalid) {
    this.toster.show('error', 'Please fill all required fields.');
    return;
  }

  this.loader = true;

  const formData = new FormData();

  formData.append("fullName", this.signUpForm.value.fullName);
  formData.append("email", this.signUpForm.value.email);
  formData.append("password", this.signUpForm.value.password);
  formData.append("schoolOrganization", this.signUpForm.value.schoolOrOrganization);
  formData.append("dateOfBirth", this.signUpForm.value.dob);
  formData.append("phoneNumber", this.signUpForm.value.phoneNumber);

  // 👉 Nested location object
  formData.append("state", this.signUpForm.value.state);
  formData.append("country", this.signUpForm.value.country);

  // 👉 Causes of interest (array or comma-separated)
  if (Array.isArray(this.signUpForm.value.interests)) {
    this.signUpForm.value.interests.forEach((item: string, index: number) => {
      formData.append(`causesOfInterest[${index}]`, item);
    });
  } else {
    formData.append("causesOfInterest", this.signUpForm.value.interests);
  }

  formData.append("referredBy", "");
  
  // 👉 Profile picture (File)
  if (this.profileUploadPic) {
    formData.append("profilePicture", this.profileUploadPic);
  }

  this.api.post('auth/register', formData).subscribe({
    next: (res) => {
      this.loader = false;
      this.toster.show('success', 'Account created successfully!');
      this.router.navigate(['/login']);
      this.loginPage = true;
      this.signUpPage = false;
    },
    error: (err) => {
      this.loader = false;
      this.toster.show('error', err.error?.message || 'Signup failed');
      console.error(err);
    }
  });
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
      this.profileUploadPic = file;
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result);
      reader.readAsDataURL(file);
    }
  }
  // onFileSelected(event: any) { this.previewUrl = event.target.files[0]; console.log(this.previewUrl) }

  forgetPassword() {
    this.router.navigate(['/forgetPassword']);
  }

}
