import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, user } from '@angular/fire/auth';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Firestore, collection, collectionData, addDoc, docData } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { doc, getDoc } from '@firebase/firestore';
import { UserProfile } from '../model/user';

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
  user$: Observable<User | null> = user(this.auth);
  userProfile$: Observable<UserProfile | null> = this.user$.pipe(
    switchMap(currentUser => currentUser
      ? docData(doc(this.firestore, 'users', currentUser.uid)) as Observable<UserProfile>
      : of(null)
    )
  );

  constructor() {
    this.testMessages$ = collectionData(this.testCollection, { idField: 'id' });
  }

  async addMessage(text: string) {
    if (!text.trim()) return;
    await addDoc(this.testCollection, { message: text });
  }
}
