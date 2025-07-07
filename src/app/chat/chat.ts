import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, user } from '@angular/fire/auth';
import { User } from 'firebase/auth';
import { Firestore, collection, collectionData, docData } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { doc, query, where } from '@firebase/firestore';
import { UserProfile } from '../model/user';
import { Room } from '../model/chatroom';
import { ChatroomService } from '../services/chatroom';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateChatroomDialog } from './create-chatroom-dialog/create-chatroom-dialog';
import { UserList } from "../user-list/user-list";
import { getDatabase, onValue, ref } from '@firebase/database';
import { getTimestampMillis, formatTimestamp } from '../util/util';
import { JoinChatroomDialog } from './join-chatroom-dialog/join-chatroom-dialog';

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
  user$: Observable<User | null> = user(this.auth);
  userProfile$: Observable<UserProfile | null> = this.user$.pipe(
    switchMap(currentUser => currentUser
      ? docData(doc(this.firestore, 'users', currentUser.uid)) as Observable<UserProfile>
      : of(null)
    )
  );
  chatroomCollection = collection(this.firestore, 'chatrooms');
  chatrooms$: Observable<Room[]>;
  userRooms$: Observable<Room[]> = this.user$.pipe(
    switchMap(currentUser => {
      if (!currentUser) return of([]);

      const visibleRoomsQuery = query(
        collection(this.firestore, 'chatrooms'),
        where('visibility', 'in', ['public', 'password'])
      );
      const publicRooms$ = collectionData(visibleRoomsQuery, { idField: 'id' }) as Observable<Room[]>;

      const memberRoomsQuery = query(
        collection(this.firestore, 'chatrooms'),
        where('visibility', '==', 'private'),
        where('members', 'array-contains', currentUser.uid)
      );
      const memberRooms$ = collectionData(memberRoomsQuery, { idField: 'id' }) as Observable<Room[]>;

      return combineLatest([publicRooms$, memberRooms$]).pipe(
        map(([publicRooms, memberRooms]) => {
          const allRooms = [...publicRooms, ...memberRooms];
          return allRooms.sort((a, b) => {
            const aTime = getTimestampMillis(a.lastMessageTimestamp);
            const bTime = getTimestampMillis(b.lastMessageTimestamp);
            return bTime - aTime;
          })
        })
      );
    })
  );
  userCollection = collection(this.firestore, 'users');
  users$: Observable<UserProfile[]>;
  usersArray: UserProfile[] = [];
  openedRoomId: string | null = null;
  displayRooms$: Observable<any[]>;
  onlineUids: string[] = [];
  formatTimestamp = formatTimestamp;
  
  addRoomForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(1)]),
    type: new FormControl('group', [Validators.required]),
    participants: new FormControl([], [Validators.required])
  });

  constructor(private dialog: MatDialog) {
    this.chatrooms$ = collectionData(this.chatroomCollection, { idField: 'id' }) as Observable<Room[]>;
    this.users$ = collectionData(this.userCollection, { idField: 'id' }) as Observable<UserProfile[]>;
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
        this.chatroomService.createChatroom(result.name, 'group', result.visibility, result.password, result.participants);
      }
    });
  }

  async createChatroom() {
    const name = this.addRoomForm.get('name')?.value || '';
    const visibility = this.addRoomForm.get('visibility')?.value || 'private';
    const password = this.addRoomForm.get('password')?.value || '';
    const participants = this.addRoomForm.get('participants')?.value || [];
    if (!this.auth.currentUser || !name.trim()) return;
    const validVisibilities = ['public', 'private', 'password'] as const;
    if (!validVisibilities.includes(visibility as any)) return;
    this.chatroomService.createChatroom(name, 'group', visibility as 'public' | 'private' | 'password', password, participants);
    this.addRoomForm.reset({ type: 'private' });
  }

  openOrJoinChatroom(room: Room) {
    const currentUserId = this.auth.currentUser?.uid;
    if (!currentUserId) return;
    if (room.members.includes(currentUserId)) {
      this.router.navigate(['/chatroom', room.id]);
    } else {
      const dialogRef = this.dialog.open(JoinChatroomDialog, {
        width: '400px',
        data: {
          roomName: room.name,
          roomVisibility: room.visibility,
          roomPassword: room.password
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          if (room.password !== result.password) return;
          const newMembers = Array.from(new Set([...(room.members || []), currentUserId]));
          if (!room.id) return;
          this.chatroomService.updateRoom(room.id, room.name, newMembers);
          this.router.navigate(['/chatroom', room.id]);
        }
      });
    }
    // this.openedRoomId = roomId;
  }

  formatLastMessage(msg: string) {
    return msg.length > 32 ? msg.slice(0, 33).trim() + '...' : msg;
  }

  isCurrentUser(userId: string) {
    return userId == this.auth.currentUser?.uid;
  }

  isUserMember(room: { members: string[] }): boolean {
    if (!this.auth.currentUser) return false;
    return Array.isArray(room.members) && room.members.includes(this.auth.currentUser.uid);
  }

  isRestrictedAccess(room: { visibility: string, members: string[] }) {
    return (room.visibility === 'password' && !this.isUserMember(room)) || (room.visibility === 'public' && !this.isUserMember(room));
  }
}
