import { Component, inject } from '@angular/core';
import { Auth, user, User } from '@angular/fire/auth';
import { collection, collectionData, doc, docData, Firestore } from '@angular/fire/firestore';
import { Observable, of, switchMap } from 'rxjs';
import { UserProfile } from '../model/user';
import { CommonModule } from '@angular/common';
import { ChatroomService } from '../services/chatroom';
import { getDatabase, onValue, ref } from '@angular/fire/database';
import { getCurrentUser } from '../util/util';
import { Collection } from '../util/constant';

@Component({
  selector: 'app-user-list',
  imports: [
    CommonModule
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss'
})
export class UserList {
  firestore = inject(Firestore);
  auth = inject(Auth);
  chatService = inject(ChatroomService);
  user$: Observable<User | null> = user(this.auth);
  userProfile$: Observable<UserProfile | null> = getCurrentUser(this.user$, this.firestore);
  userCollection = collection(this.firestore, Collection.USERS);
  users$: Observable<any[]>;
  onlineUids: string[] = [];

  constructor() {
    this.users$ = collectionData(this.userCollection, { idField: 'id' });
    const statusRef = ref(getDatabase(), '/status');
    onValue(statusRef, (snapshot) => {
      this.onlineUids = Object.keys(snapshot.val() || {}).filter(
        uid => snapshot.val()[uid].state === 'online'
      );
    });
  }

  openPrivateChat(user2: string) {
    if (!this.auth.currentUser) return;
    this.chatService.getOrCreatePrivateRoom(this.auth.currentUser.uid, user2);
  }
}
