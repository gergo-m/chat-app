import { Component, inject } from '@angular/core';
import { FormsModule, Validators, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Auth, GoogleAuthProvider } from '@angular/fire/auth';
import { GithubAuthProvider, signInWithPopup } from '@firebase/auth';
import { ErrorMessage, ProviderType } from '../../util/constant';
import { Register } from '../register/register';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    CommonModule,
    MatIconModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  auth = inject(Auth);
  authService = inject(AuthService);
  provider = ProviderType;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });
  errorMessage: string = '';

  constructor() {}

  async login() {
    try {
      if (this.loginForm.invalid) {
        this.errorMessage = ErrorMessage.FORM_ERROR;
        return;
      }
      const email = this.loginForm.get('email')?.value ||'';
      const password = this.loginForm.get('password')?.value ||'';
      await this.authService.login(email, password);
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
