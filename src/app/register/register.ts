import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { Auth, GoogleAuthProvider } from '@angular/fire/auth';
import { signInWithPopup, updateProfile } from '@firebase/auth';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { addDoc, collection, collectionData, doc, Firestore, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

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
  users$: Observable<any[]>;
  
  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {
    this.users$ = collectionData(this.userCollection, { idField: 'id' });
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
      this.router.navigateByUrl('/');
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
  }
}
