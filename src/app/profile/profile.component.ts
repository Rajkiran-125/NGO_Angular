import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, NgModel, FormsModule } from '@angular/forms';
import { AsyncPipe, NgIf } from '@angular/common';
import { ApiService } from '../Service/api.service';
import { TosterService } from '../Service/toster.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  updateProfile: any = FormGroup;
  myProfile: boolean = false;
  editProfile: boolean = true;
  user: any;
  isDisabled = true;
  previewUrl: string | ArrayBuffer | null = null;


  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private toster: TosterService
  ) { }

  ngOnInit() {

    this.loadProfileData();

    this.updateProfile = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      userName: ['', Validators.required],
      password: ['', Validators.required],
      organization: ['', Validators.required],
      dob: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      refCode: ['', Validators.required],
      interests: ['', Validators.required],
    });
  }

  enableEdit() {
    console.log('')
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result);
      reader.readAsDataURL(file);
    }
  }

  onImageChange(event) {
    console.log('');
  }

  // loadProfileData() {
  //   try {
  //     // this.isLoading = true;
  //     const authToken = localStorage.getItem("authToken");
  //     let token = {
  //       headers: {
  //         Authorization: `Bearer ${authToken}`
  //       }
  //     }
  //     this.api.get('volunteers/profile', token).subscribe(res => {
  //       console.log(this.updateProfile);
  //       console.log(res);
  //       let user = res.user;

  //     });
  //   } catch (err) {
  //     // this.loader = false;
  //     this.toster.show("error", err.message);
  //     console.log(err);
  //   }
  // }


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

          console.log('user: >> ', user)

          this.updateProfile.patchValue({
            firstName: user.profile.firstName || '',
            lastName: user.profile.lastName || '',
            organization: user.profile.schoolOrganization || '',
            dob: user.profile.dateOfBirth ? user.profile.dateOfBirth.split('T')[0] : '',
            country: `${user.profile.location?.state || ''}, ${user.profile.location?.country || ''}`,
            phoneNumber: user.profile.phoneNumber || '',
            email: user.email || '',
            interests: user.profile.causesOfInterest?.join(', ') || ''
          });

          console.log('Profile form patched:', this.updateProfile.value);
        },
        error: (err) => {
          this.toster.show("error", err.message);
          console.error(err);
        }
      });
    } catch (err) {
      this.toster.show("error", err.message);
      console.error(err);
    }
  }



}
