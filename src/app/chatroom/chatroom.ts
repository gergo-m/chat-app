import { Component, inject } from '@angular/core';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { Message } from '../model/message';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../services/message';
import { ChatroomService } from '../services/chatroom';
import { doc, docData, Firestore } from '@angular/fire/firestore';
import { Room } from '../model/chatroom';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { UserProfile } from '../model/user';

interface MessageWithSender extends Message {
  senderName?: string;
  senderProfile?: UserProfile;
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
    MatButton
  ],
  templateUrl: './chatroom.html',
  styleUrl: './chatroom.scss'
})
export class Chatroom {
  route = inject(ActivatedRoute);
  firestore = inject(Firestore);
  messageService = inject(MessageService);
  roomId = this.route.snapshot.params['id'];
  messages$: Observable<Message[]> = this.messageService.getRoomMessages(this.roomId);
  chatroom$: Observable<Room | undefined> = this.route.params.pipe(
    switchMap(params => {
      const roomId = params['id'];
      return this.chatroomService.getChatroom(roomId);
    })
  );

  messagesWithSenders$: Observable<MessageWithSender[]> = this.messageService.getRoomMessages(this.roomId).pipe(
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

          return messages.map(message => ({
            ...message,
            senderName: senderMap.get(message.senderId)?.name || 'Unknown',
            senderProfile: senderMap.get(message.senderId)
          }))
        })
      )
    })
  )

  sendForm = new FormGroup({
    message: new FormControl('', [Validators.required, Validators.minLength(1)])
  })

  constructor(
    private chatroomService: ChatroomService) {}

  async sendMessage() {
    const messageValue = this.sendForm.get('message')?.value ?? '';
    if (!messageValue.trim()) return;
    this.messageService.sendMessage(this.roomId, messageValue);
    this.sendForm.reset();
  }
}
