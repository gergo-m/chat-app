import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { Auth, user } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { MatButtonModule } from '@angular/material/button';
import { SidenavService } from './shared/services/sidenav';
import { Subscription } from 'rxjs';
import { PresenceService } from './shared/services/presence';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnDestroy {
  protected title = 'chat-app';
  firestore = inject(Firestore);
  auth = inject(Auth);
  router = inject(Router);
  sidenavService = inject(SidenavService);
  userSub: Subscription;
  presenceService = inject(PresenceService);

  constructor() {
    this.userSub = user(this.auth).subscribe(currentUser => {
      if (currentUser && (this.router.url === '/login' || this.router.url === '/register')) {
        this.router.navigate(['/']);
      }
      if (!currentUser) {
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
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

  onMenuClick() {
    this.sidenavService.toggle();
  }
}
