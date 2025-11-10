import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, NgModel } from '@angular/forms';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  updateProfile: any = FormGroup;
  myProfile:boolean = true;
  editProfile:boolean = false;
  user:any;
  

  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.updateProfile = this.fb.group({
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




}
