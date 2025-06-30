import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { Firestore } from '@angular/fire/firestore';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButton,
    RouterLink
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'chat-app';
  firestore = inject(Firestore);
  auth = inject(Auth);
  router = inject(Router);

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
    if (user) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/login']);
    }
  });
  }

  get user() {
    return this.auth.currentUser;
  }

  logout() {
    this.auth.signOut();
    this.router.navigate(['/login']);
  }

  login() {
    this.router.navigate(['/login']);
  }

  register() {
    this.router.navigate(['/register']);
  }
}
