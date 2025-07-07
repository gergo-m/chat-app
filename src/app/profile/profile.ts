import { Component, inject } from '@angular/core';
import { Auth, updateEmail, updatePassword, updateProfile, user, User } from '@angular/fire/auth';
import { doc, docData, Firestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, of, switchMap } from 'rxjs';
import { UserProfile } from '../model/user';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { updateDoc } from '@firebase/firestore';
import { MatButton } from '@angular/material/button';
import { getCurrentUser } from '../util/util';
import { Collection } from '../util/constant';

@Component({
  selector: 'app-profile',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatLabel,
    MatInput,
    MatButton
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  auth = inject(Auth);
  firestore = inject(Firestore);

  user$: Observable<User | null> = user(this.auth);
  userProfile$: Observable<UserProfile | null> = getCurrentUser(this.user$, this.firestore);

  profileForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  async saveProfile() {
    const currentUser = await this.auth.currentUser;
    if (!currentUser) return;

    const name = this.profileForm.get('name')?.value;
    const email = this.profileForm.get('email')?.value;
    const password = this.profileForm.get('password')?.value;

    if (name) await updateProfile(currentUser, { displayName: name });
    if (email && email != currentUser.email) await updateEmail(currentUser, email);
    if (password) await updatePassword(currentUser, password);

    await updateDoc(doc(this.firestore, Collection.USERS, currentUser.uid), { name, email });
  }
}
