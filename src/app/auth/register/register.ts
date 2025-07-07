import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { Auth, GoogleAuthProvider } from '@angular/fire/auth';
import { signInWithPopup, updateProfile } from '@firebase/auth';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { collection, collectionData, doc, Firestore, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UserProfile } from '../../model/user';

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
  userCollection = collection(this.firestore, 'users');
  users$: Observable<UserProfile[]>;
  
  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {
    this.users$ = collectionData(this.userCollection, { idField: 'id' }) as Observable<UserProfile[]>;
  }

  async register() {
    try {
      if (this.registerForm.invalid) {
        this.errorMessage = "Please correct the form errors.";
        return;
      }
      const name = this.registerForm.get('name')?.value ||'';
      const email = this.registerForm.get('email')?.value ||'';
      const password = this.registerForm.get('password')?.value ||'';
      const userCredential = await this.authService.register(email, password);
      const uid = userCredential.user.uid;
      await setDoc(doc(this.firestore, 'users', uid), {
        name, email, createdAt: new Date()
      });
      await updateProfile(userCredential.user, { displayName: name });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error) {
        switch (error.code) {
          case "auth/invalid-credential":
            this.errorMessage = "Invalid email or password";
            break;
          default:
            this.errorMessage = "Authentication failed. Please try again.";
        }
      } else {
        this.errorMessage = "An unexpected error occurred."
      }
    }
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const user = await signInWithPopup(this.auth, provider);
    const uid = user.user.uid;
    const name = user.user.displayName;
    const email = user.user.email;
    console.log(user);
    console.log(user.user);
    console.log(user.user.email);
    await setDoc(doc(this.firestore, 'users', uid), {
      name, email, createdAt: new Date()
    });
    await updateProfile(user.user, { displayName: name });
  }
}
