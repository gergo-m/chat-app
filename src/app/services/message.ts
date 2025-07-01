import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { addDoc, collection, collectionData, Firestore, orderBy, query } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Message } from '../model/message';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  auth = inject(Auth);
  firestore = inject(Firestore);

  constructor() { }

  async sendMessage(roomId: string, text: string) {
    const user = this.auth.currentUser;
    if (!user) return;

    await addDoc(collection(this.firestore, `chatrooms/${roomId}/messages`), {
      senderId: user.uid,
      text,
      timestamp: new Date(),
      seenBy: [user.uid]
    });
  }

  getRoomMessages(roomId: string): Observable<Message[]> {
    const messagesRef = collection(this.firestore, `chatrooms/${roomId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<Message[]>;
  }
}
