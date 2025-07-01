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
import { Room } from '../model/chatroom';
import { ChatroomService } from '../services/chatroom';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-chat',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButton,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule
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
  chatroomCollection = collection(this.firestore, 'chatrooms');
  chatrooms$: Observable<any[]>;
  chatroomService = inject(ChatroomService);

  addRoomForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(1)]),
    type: new FormControl('group', [Validators.required])
  });

  constructor() {
    this.testMessages$ = collectionData(this.testCollection, { idField: 'id' });
    this.chatrooms$ = collectionData(this.chatroomCollection, { idField: 'id' });
  }

  async addMessage(text: string) {
    if (!text.trim()) return;
    await addDoc(this.testCollection, { message: text });
  }

  async createChatroom() {
    const name = this.addRoomForm.get('name')?.value || '';
    const type = this.addRoomForm.get('type')?.value || 'group';
    if (!this.auth.currentUser || !name.trim()) return;
    const validTypes = ['group', 'private'] as const;
    if (!validTypes.includes(type as any)) return;
    this.chatroomService.createChatroom(name, type as "group" | "private", [this.auth.currentUser.uid]);
    this.addRoomForm.reset({ type: 'group' });
  }

  openChatroom(roomId: string) {
    this.router.navigate(['/chatroom', roomId]);
  }
}
