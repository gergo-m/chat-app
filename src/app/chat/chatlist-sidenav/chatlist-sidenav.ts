import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, user } from '@angular/fire/auth';
import { User } from 'firebase/auth';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable, of, Subscription, switchMap } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { query, where } from '@firebase/firestore';
import { UserProfile } from '../../shared/model/user';
import { Room } from '../../shared/model/chatroom';
import { ChatroomService } from '../../shared/services/chatroom';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateChatroomDialog } from '../create-chatroom-dialog/create-chatroom-dialog';
import { getDatabase, onValue, ref } from '@firebase/database';
import { getTimestampMillis, formatTimestamp, getCurrentUser } from '../../shared/util/util';
import { JoinChatroomDialog } from '../join-chatroom-dialog/join-chatroom-dialog';
import { Collection } from '../../shared/util/constant';
import { Chatroom } from '../../chatroom/chatroom';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SidenavService } from '../../shared/services/sidenav';

@Component({
  selector: 'app-chatlist-sidenav',
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
    Chatroom,
    MatSidenavModule,
  ],
  templateUrl: './chatlist-sidenav.html',
  styleUrl: './chatlist-sidenav.scss'
})
export class ChatlistSidenav implements OnInit, OnDestroy {
  firestore = inject(Firestore);
  auth = inject(Auth);
  router = inject(Router);
  dialog = inject(MatDialog);
  observer = inject(BreakpointObserver);
  chatService = inject(ChatroomService);
  chatroomService = inject(ChatroomService);
  sidenavService = inject(SidenavService);
  user$: Observable<User | null> = user(this.auth);
  userProfile$: Observable<UserProfile | null> = getCurrentUser(this.user$, this.firestore);
  currentUserId = this.auth.currentUser?.uid;
  chatroomCollection = collection(this.firestore, Collection.CHATROOMS);
  chatrooms$: Observable<Room[]>;
  userRooms$: Observable<Room[]> = this.user$.pipe(
    switchMap(currentUser => {
      if (!currentUser) return of([]);

      const visibleRoomsQuery = query(
        collection(this.firestore, Collection.CHATROOMS),
        where('visibility', 'in', ['public', 'password'])
      );
      const publicRooms$ = collectionData(visibleRoomsQuery, { idField: 'id' }) as Observable<Room[]>;

      const memberRoomsQuery = query(
        collection(this.firestore, Collection.CHATROOMS),
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
  userCollection = collection(this.firestore, Collection.USERS);
  users$: Observable<UserProfile[]>;
  usersArray: UserProfile[] = [];
  openedRoomId = '';
  displayRooms$: Observable<any[]>;
  onlineUids$ = new BehaviorSubject<string[]>([]);
  onlineUsers$: Observable<UserProfile[]>;
  activeTab: 'chatrooms' | 'onlineUsers' = 'chatrooms';
  formatTimestamp = formatTimestamp;
  onlineUserCount = 0;
  searchChat$ = new BehaviorSubject<string>('');
  filteredRooms$: Observable<any[]>;
  searchUser$ = new BehaviorSubject<string>('');
  filteredUsers$: Observable<any[]>;
  sidenavOpened = true;
  
  addRoomForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(1)]),
    type: new FormControl('group', [Validators.required]),
    participants: new FormControl([], [Validators.required])
  });
  @ViewChild(MatSidenav) sidenav!: MatSidenav;
  private sub: Subscription;
  isMobile = true;

  constructor() {
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
      const onlineUids = Object.keys(snapshot.val() || {}).filter(
        uid => snapshot.val()[uid].state === 'online'
      );
      this.onlineUids$.next(onlineUids);
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
    );
    this.onlineUsers$ = combineLatest([
      this.users$,
      this.onlineUids$
    ]).pipe(
      map(([users, onlineUids]) => {
        this.onlineUserCount++;
        return users.filter(user => onlineUids.includes(user.id) && user.id !== this.auth.currentUser?.uid);
      })
    );
    this.filteredRooms$ = combineLatest([
      this.displayRooms$,
      this.searchChat$
    ]).pipe(
      map(([rooms, searchChat]) => {
        const chatName = searchChat.trim().toLowerCase();
        if (!chatName) return rooms;
        return rooms.filter(room => room.name.toLowerCase().includes(chatName));
      })
    );
    this.filteredUsers$ = combineLatest([
      this.onlineUsers$,
      this.searchUser$
    ]).pipe(
      map(([users, searchUser]) => {
        const userName = searchUser.trim().toLowerCase();
        if (!userName) return users;
        return users.filter(user => user.name.toLowerCase().includes(userName));
      })
    );
    this.sub = this.sidenavService.toggleSidenav$.subscribe(() => {
      this.sidenav.toggle();
    });
  }

  ngOnInit() {
    this.users$.pipe().subscribe(users => {
        this.usersArray = users;
    });
    this.observer.observe(['(max-width: 1020px']).subscribe((screenSize) => {
      if (screenSize.matches) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
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

  hasPrivateRoom(user2: string) {
    if (!this.auth.currentUser) return;
    return this.chatroomService.hasPrivateRoom(this.auth.currentUser.uid, user2);
  }

  getPrivateRoom(user2: string) {
    if (!this.auth.currentUser) return;
    return this.hasPrivateRoom(user2) ? this.chatroomService.getOrCreatePrivateRoom(this.auth.currentUser.uid, user2) : null;
  }

  openOrJoinChatroom(room: Room) {
    const currentUserId = this.auth.currentUser?.uid;
    if (!currentUserId) return;
    if (room.members.includes(currentUserId)) {
      if (!room.id) return;
      this.openedRoomId = room.id;
      const lastMessageSeenBy = Array.isArray(room.lastMessageSeenBy) ? room.lastMessageSeenBy : [];
      if (!lastMessageSeenBy.includes(currentUserId)) {
        this.chatroomService.updateRoomSeenBy(room.id, [...lastMessageSeenBy, currentUserId]);
      }
      console.log(room.lastMessageSeenBy);
      console.log(currentUserId);
      console.log(this.currentUserId);
      if (this.isMobile) {
        this.sidenav.toggle();
      }
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
          this.openedRoomId = room.id;
        }
      });
    }
  }

  formatLastMessage(msg: string) {
    return msg.length > 32 ? msg.slice(0, 24).trim() + '...' : msg;
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

  async openPrivateChat(user2: string) {
    if (!this.auth.currentUser) return;
    this.openedRoomId = await this.chatService.getOrCreatePrivateRoom(this.auth.currentUser.uid, user2);
  }
}
