import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatlistSidenav } from "./chatlist-sidenav/chatlist-sidenav";

@Component({
  selector: 'app-chat',
  imports: [
    CommonModule,
    ChatlistSidenav
],
  templateUrl: './chat.html',
  styleUrl: './chat.scss'
})
export class Chat {
}
