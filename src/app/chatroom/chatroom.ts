import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { Message } from '../model/message';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../services/message';
import { ChatroomService } from '../services/chatroom';
import { collection, collectionData, doc, docData, Firestore } from '@angular/fire/firestore';
import { Room } from '../model/chatroom';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { UserProfile } from '../model/user';
import { Auth, user, User } from '@angular/fire/auth';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { UpdateChatroomDialog } from './update-chatroom-dialog/update-chatroom-dialog';

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
    MatButton,
    MatIconModule
  ],
  templateUrl: './chatroom.html',
  styleUrl: './chatroom.scss'
})
export class Chatroom {
  route = inject(ActivatedRoute);
  firestore = inject(Firestore);
  messageService = inject(MessageService);
  chatroomService = inject(ChatroomService);
  auth = inject(Auth);
  router = inject(Router);
  user$: Observable<User | null> = user(this.auth);
  userProfile$: Observable<UserProfile | null> = this.user$.pipe(
    switchMap(currentUser => currentUser
      ? docData(doc(this.firestore, 'users', currentUser.uid)) as Observable<UserProfile>
      : of(null)
    )
  );
  roomId = this.route.snapshot.params['id'];
  // @Input() roomId!: string;
  messages$: Observable<Message[]> = this.messageService.getRoomMessages(this.roomId);
  chatroom$: Observable<Room | undefined> = this.route.params.pipe(
    switchMap(params => {
      const roomId = params['id'];
      return this.chatroomService.getChatroom(roomId);
    })
  );
  // chatroom$: Observable<Room | undefined> =  this.chatroomService.getChatroom(this.roomId);
  userCollection = collection(this.firestore, 'users');
  users$: Observable<UserProfile[]>;
  usersArray: UserProfile[] = [];

  messagesWithSenders$: Observable<MessageWithPrevSender[]> = this.messageService.getRoomMessages(this.roomId).pipe(
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

  sendForm = new FormGroup({
    message: new FormControl('', [Validators.required, Validators.minLength(1)])
  })

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;

  constructor(private dialog: MatDialog) {
    this.users$ = collectionData(this.userCollection, { idField: 'id' }) as Observable<UserProfile[]>;
  }
  
  ngOnInit() {
    this.users$.pipe().subscribe(users => {
        this.usersArray = users;
    });
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
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch(error) {
      console.log("Error while scrolling:", error);
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
