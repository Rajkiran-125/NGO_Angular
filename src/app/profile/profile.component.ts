import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, NgModel, FormsModule } from '@angular/forms';
import { AsyncPipe, NgIf } from '@angular/common';
import { ApiService } from '../Service/api.service';
import { TosterService } from '../Service/toster.service';
import { environment } from '../../environments/environment';

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
  fileBaseUrl = environment.fileBaseUrl;


  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private toster: TosterService
  ) { }

  ngOnInit() {

    this.loadProfileData();

    this.updateProfile = this.fb.group({
      fullName: ['', Validators.required],
      // lastName: ['', Validators.required],
      email: ['', Validators.required],
      userName: ['', Validators.required],
      password: ['', Validators.required],
      organization: ['', Validators.required],
      dob: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      // refCode: ['', Validators.required],
      interests: ['', Validators.required],
    });

    // updateProfile = this.fb.group({
    //   fullName: ['', Validators.required],
    //   organization: ['', Validators.required],
    //   dob: ['', Validators.required],
    //   email: ['', [Validators.required, Validators.email]],
    //   phoneNumber: ['', Validators.required],
    //   bio: ['']
    // });
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

          console.log('user: >> ', user);

          this.updateProfile.patchValue({
            fullName: user.profile.fullName || '',
            // lastName: user.profile.lastName || '',
            organization: user.profile.schoolOrganization || '',
            dob: user.profile.dateOfBirth ? user.profile.dateOfBirth.split('T')[0] : '',
            country: `${user.profile.location?.state || ''}, ${user.profile.location?.country || ''}`,
            phoneNumber: user.profile.phoneNumber || '',
            email: user.email || '',
            interests: user.profile.causesOfInterest?.join(', ') || ''
          });
          this.previewUrl = user.profile.profilePicture;

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

  updateProfileFun() {
    if (this.updateProfile.invalid) {
      this.toster.show('error', 'Please fill all required fields.');
      return;
    }

    // this.loader = true;

    const formData = {
      fullName: this.updateProfile.value.fullName,
      email: this.updateProfile.value.email,
      phoneNumber: this.updateProfile.value.phoneNumber,
      dateOfBirth: this.updateProfile.value.dob,
      organization: this.updateProfile.value.organization,
      bio: this.updateProfile.value.bio,
      profilePicture: this.previewUrl
    };

    this.api.put('auth/update-profile', formData).subscribe({
      next: (res) => {
        // this.loader = false;
        this.toster.show('success', 'Profile updated successfully!');
        this.editProfile = false;
      },
      error: (err) => {
        // this.loader = false;
        this.toster.show('error', err.error?.message || 'Failed to update profile');
        console.error(err);
      }
    });
  }

}
