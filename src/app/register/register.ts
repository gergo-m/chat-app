import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule, NgModel } from '@angular/forms';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    MatButton
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async register() {
    try {
      await this.authService.register(this.email, this.password);
      this.router.navigateByUrl('/');
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }
}
