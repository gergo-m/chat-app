import { Component, inject } from '@angular/core';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatInputModule, MatLabel } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

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

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async login() {
    try {
      if (this.loginForm.invalid) {
        this.errorMessage = "Please correct the form errors.";
        return;
      }
      const email = this.loginForm.get('email')?.value ||'';
      const password = this.loginForm.get('password')?.value ||'';
      await this.authService.login(email, password);
      this.router.navigateByUrl('/');
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

}
