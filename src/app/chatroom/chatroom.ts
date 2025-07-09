import { AfterViewChecked, Component, ElementRef, inject, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { combineLatest, map, Observable, of, Subscription, switchMap } from 'rxjs';
import { Message } from '../shared/model/message';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../shared/services/message';
import { ChatroomService } from '../shared/services/chatroom';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { Room } from '../shared/model/chatroom';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { UserProfile } from '../shared/model/user';
import { Auth, user, User } from '@angular/fire/auth';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { UpdateChatroomDialog } from './update-chatroom-dialog/update-chatroom-dialog';
import { displayDateAbove, formatTimestamp, formatTimestampFull, getCurrentUser } from '../shared/util/util';
import { Collection } from '../shared/util/constant';

interface MessageWithSender extends Message {
  senderName?: string;
  senderProfile?: UserProfile;
}

interface MessageWithPrevSender extends MessageWithSender {
  prev: MessageWithSender | null;
}

@Component({
  selector: 'app-chatroom',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatLabel,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './chatroom.html',
  styleUrl: './chatroom.scss'
})
export class Chatroom implements OnDestroy, OnChanges, AfterViewChecked {
  route = inject(ActivatedRoute);
  firestore = inject(Firestore);
  auth = inject(Auth);
  router = inject(Router);
  dialog = inject(MatDialog);
  messageService = inject(MessageService);
  chatroomService = inject(ChatroomService);
  formatTimestamp = formatTimestamp;
  formatTimestampFull = formatTimestampFull;
  displayDateAbove = displayDateAbove;
  user$: Observable<User | null> = user(this.auth);
  userProfile$: Observable<UserProfile | null> = getCurrentUser(this.user$, this.firestore);
  @Input() roomId!: string;
  chatroom$!: Observable<Room | undefined>;
  userCollection = collection(this.firestore, Collection.USERS);
  users$: Observable<UserProfile[]>;
  usersArray: UserProfile[] = [];
  usersArraySub: Subscription;
  messagesWithSenders$!: Observable<MessageWithPrevSender[]>;

  sendForm = new FormGroup({
    message: new FormControl('', [Validators.required, Validators.minLength(1)])
  });

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;

  constructor() {
    this.users$ = collectionData(this.userCollection, { idField: 'id' }) as Observable<UserProfile[]>;
    this.usersArraySub = this.users$.pipe().subscribe(users => {
        this.usersArray = users;
    });
  }
  
  ngOnDestroy() {
    this.usersArraySub.unsubscribe();
  }

  ngOnChanges() {
    if (this.roomId) {
      this.chatroom$ = this.chatroomService.getChatroom(this.roomId);
      this.messagesWithSenders$ = this.messageService.getRoomMessages(this.roomId).pipe(
    switchMap(messages => {
      if (!messages || messages.length === 0) {
        return of([]);
      }
      const uniqueSenderIds = [...new Set(messages.map(msg => msg.senderId))];
      const senderRequests = uniqueSenderIds.map(senderId => this.messageService.getSender(senderId));
      return combineLatest(senderRequests).pipe(
        map(senderProfiles => {
          const senderMap = new Map<string, UserProfile>();
          uniqueSenderIds.forEach((senderId, index) => {
            if (senderProfiles[index]) {
              senderMap.set(senderId, senderProfiles[index]);
            }
          });

          return messages.map((message, i, arr) => ({
            ...message,
            senderName: senderMap.get(message.senderId)?.name || 'Unknown',
            senderProfile: senderMap.get(message.senderId),
            prev: i > 0 ? arr[i - 1] : null
          }))
        })
      )
    })
  )
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  async sendMessage() {
    const messageValue = this.sendForm.get('message')?.value ?? '';
    if (!messageValue.trim()) return;
    this.messageService.sendMessage(this.roomId, messageValue);
    this.sendForm.reset();
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      try {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      } catch(error) {
        console.log("Error while scrolling:", error);
      }
    }
  }

  async openUpdateChatroomDialog(currentName: string, currentParticipants: string[]) {
    const currentUserId = this.auth.currentUser?.uid;

    const dialogRef = this.dialog.open(UpdateChatroomDialog, {
      width: '400px',
      data: {
        users: this.usersArray,
        currentUserId,
        currentName,
        currentParticipants
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.chatroomService.updateRoom(this.roomId, result.name, result.participants);
      }
    })
  }

  getChatroomName(room: Room | null | undefined) {
    if (!room) return '';
    if (room.type === 'group') return room.name;
    if (!this.auth.currentUser) return '';
    const otherUid = room.members.find((uid: string) => uid !== this.auth.currentUser?.uid);
    const otherUser = this.usersArray.find((u: UserProfile) => u.id === otherUid);
    return otherUser?.name;
  }

  deleteChatroom() {
    this.chatroomService.deleteRoom(this.roomId);
    this.router.navigateByUrl('');
  }

  leaveChatroom(room: { name: string, members: string[] }) {
    const currentUserId = this.auth.currentUser?.uid;
    if (!currentUserId) return;
    const currentMembers = Array.from(room.members);
    const index = currentMembers.indexOf(currentUserId, 0);
    if (index > -1) {
      currentMembers.splice(index, 1);
    }
    const newMembers = Array.from(currentMembers);
    this.chatroomService.updateRoom(this.roomId, room.name, newMembers);
    this.router.navigateByUrl('');
  }
}
