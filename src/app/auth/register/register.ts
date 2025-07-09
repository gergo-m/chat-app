import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { Auth, GoogleAuthProvider } from '@angular/fire/auth';
import { GithubAuthProvider, signInWithPopup, updateProfile } from '@firebase/auth';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { collection, collectionData, doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UserProfile } from '../../model/user';
import { Collection, ErrorMessage, ProviderType } from '../../util/constant';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    MatButton,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    CommonModule,
    MatIconModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  firestore = inject(Firestore);
  auth = inject(Auth);
  provider = ProviderType;
  userCollection = collection(this.firestore, Collection.USERS);
  users$: Observable<UserProfile[]>;
  authService = inject(AuthService);
  
  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });
  errorMessage: string = '';

  constructor(private router: Router) {
    this.users$ = collectionData(this.userCollection, { idField: 'id' }) as Observable<UserProfile[]>;
  }

  async register() {
    try {
      if (this.registerForm.invalid) {
        this.errorMessage = ErrorMessage.FORM_ERROR;
        return;
      }
      const name = this.registerForm.get('name')?.value ||'';
      const email = this.registerForm.get('email')?.value ||'';
      const password = this.registerForm.get('password')?.value ||'';
      const userCredential = await this.authService.register(email, password);
      const uid = userCredential.user.uid;
      await setDoc(doc(this.firestore, Collection.USERS, uid), {
        name, email, createdAt: new Date()
      });
      await updateProfile(userCredential.user, { displayName: name });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error) {
        switch (error.code) {
          case "auth/invalid-credential":
            this.errorMessage = ErrorMessage.INVALID_CRED;
            break;
          default:
            this.errorMessage = ErrorMessage.AUTH_FAILED;
        }
      } else {
        this.errorMessage = ErrorMessage.UNEXPECTED_ERR;
      }
    }
  }
}
