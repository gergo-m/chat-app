import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, user } from '@angular/fire/auth';
import { User } from 'firebase/auth';
import { Firestore, collection, collectionData, addDoc, docData } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { doc, getDoc, query, where } from '@firebase/firestore';
import { UserProfile } from '../model/user';
import { Room } from '../model/chatroom';
import { ChatroomService } from '../services/chatroom';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateChatroomDialog } from './create-chatroom-dialog/create-chatroom-dialog';
import { Chatroom } from "../chatroom/chatroom";
import { UserList } from "../user-list/user-list";
import { getDatabase, onValue, ref } from '@firebase/database';

@Component({
  selector: 'app-chat',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    MatDialogModule,
    UserList
],
  templateUrl: './chat.html',
  styleUrl: './chat.scss'
})
export class Chat {
  firestore = inject(Firestore);
  auth = inject(Auth);
  router = inject(Router);
  chatroomService = inject(ChatroomService);
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
  userRooms$: Observable<any[]> = this.user$.pipe(
    switchMap(currentUser => {
      if (!currentUser) return of([]);
      const q = query(
        collection(this.firestore, 'chatrooms'),
        where('members', 'array-contains', currentUser.uid)
      );
      return collectionData(q, { idField: 'id' }) as Observable<any[]>;
    })
  );
  userCollection = collection(this.firestore, 'users');
  users$: Observable<any[]>;
  usersArray: any[] = [];
  openedRoomId: string | null = null;
  displayRooms$: Observable<any[]>;
  onlineUids: string[] = [];

  
  addRoomForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(1)]),
    type: new FormControl('group', [Validators.required]),
    participants: new FormControl([], [Validators.required])
  });

  constructor(private dialog: MatDialog) {
    this.testMessages$ = collectionData(this.testCollection, { idField: 'id' });
    this.chatrooms$ = collectionData(this.chatroomCollection, { idField: 'id' });
    this.users$ = collectionData(this.userCollection, { idField: 'id' });
    this.user$.subscribe(currentUser => {
      const initialParticipants = currentUser ? [currentUser.uid] : [];
      this.addRoomForm = new FormGroup({
        name: new FormControl('', [Validators.required, Validators.minLength(1)]),
        type: new FormControl('group', [Validators.required]),
        participants: new FormControl(initialParticipants, [Validators.required])
      });
    });
    const statusRef = ref(getDatabase(), '/status');
    onValue(statusRef, (snapshot) => {
      this.onlineUids = Object.keys(snapshot.val() || {}).filter(
        uid => snapshot.val()[uid].state === 'online'
      );
    });
    this.displayRooms$ = combineLatest([
      this.userRooms$,
      this.user$,
      this.users$
    ]).pipe(
      map(([rooms, currentUser, users]) => {
        return rooms.map(room => {
          if (room.type === 'private' && Array.isArray(room.members) && currentUser) {
            const otherUid = room.members.find((uid: string) => uid !== currentUser.uid);
            const otherUser = users.find((u: any) => u.id === otherUid);
            return {
              ...room,
              name: otherUser ? otherUser.name : 'Uknown room',
              otherUid: otherUid
            };
          } else {
            return {
              ...room,
              name: room.name,
              otherUid: ''
            };
          }
        })
      })
    )
  }

  ngOnInit() {
    this.users$.pipe().subscribe(users => {
        this.usersArray = users;
    });
  }

  async addMessage(text: string) {
    if (!text.trim()) return;
    await addDoc(this.testCollection, { message: text });
  }

  async openCreateChatroomDialog() {
    const currentUserId = this.auth.currentUser?.uid;

    const dialogRef = this.dialog.open(CreateChatroomDialog, {
      width: '400px',
      data: {
        users: this.usersArray,
        currentUserId
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.chatroomService.createChatroom(result.name, result.type, result.participants);
      }
    });
  }

  async createChatroom() {
    const name = this.addRoomForm.get('name')?.value || '';
    const type = this.addRoomForm.get('type')?.value || 'group';
    const participants = this.addRoomForm.get('participants')?.value || [];
    if (!this.auth.currentUser || !name.trim()) return;
    const validTypes = ['group', 'private'] as const;
    if (!validTypes.includes(type as any)) return;
    this.chatroomService.createChatroom(name, type as "group" | "private", participants);
    this.addRoomForm.reset({ type: 'group' });
  }

  openChatroom(roomId: string) {
    this.router.navigate(['/chatroom', roomId]);
    // this.openedRoomId = roomId;
  }

  formatLastMessage(msg: string) {
    return msg.length > 32 ? msg.slice(0, 33).trim() + '...' : msg;
  }

  formatTimestamp(timestamp: { seconds: number, nanoseconds: number }) {
    const date = new Date(timestamp.seconds * 1000);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  isCurrentUser(userId: string) {
    return userId == this.auth.currentUser?.uid;
  }
}
