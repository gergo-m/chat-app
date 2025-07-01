import { Component, inject } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { Message } from '../model/message';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../services/message';

@Component({
  selector: 'app-chatroom',
  imports: [],
  templateUrl: './chatroom.html',
  styleUrl: './chatroom.scss'
})
export class Chatroom {
  route = inject(ActivatedRoute);
  messages$: Observable<Message[]> = this.route.params.pipe(
    switchMap(params => {
      const roomId = params['id'];
      return this.messageService.getRoomMessages(roomId);
    })
  );

  constructor(private messageService: MessageService) { }
}
