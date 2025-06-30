import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { Firestore, collection, collectionData, addDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-chat',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButton,
    MatInputModule
  ],
  templateUrl: './chat.html',
  styleUrl: './chat.scss'
})
export class Chat {
  firestore = inject(Firestore);
  auth = inject(Auth);
  router = inject(Router);
  testCollection = collection(this.firestore, 'test');
  testMessages$: Observable<any[]>;

  constructor() {
    this.testMessages$ = collectionData(this.testCollection, { idField: 'id' });
    onAuthStateChanged(this.auth, (user) => {
    if (user) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/login']);
    }
  });
  }

  async addMessage(text: string) {
    if (!text.trim()) return;
    await addDoc(this.testCollection, { message: text });
  }
}
