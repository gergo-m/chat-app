import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { addDoc, collection, collectionData, doc, docData, Firestore, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Message } from '../model/message';
import { UserProfile } from '../model/user';

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
    await updateDoc(doc(this.firestore, `chatrooms/${roomId}`), { lastMessage: text, lastMessageTimestamp: new Date() })
  }

  getRoomMessages(roomId: string): Observable<Message[]> {
    const messagesRef = collection(this.firestore, `chatrooms/${roomId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<Message[]>;
  }

  getSender(userId: string): Observable<UserProfile | undefined> {
    const userRef = doc(this.firestore, 'users', userId);
    return docData(userRef) as Observable<UserProfile>;
  }
}
