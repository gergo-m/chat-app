import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { addDoc, collection, collectionData, doc, docData, Firestore, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Message } from '../model/message';
import { UserProfile } from '../model/user';
import { Collection } from '../util/constant';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  auth = inject(Auth);
  private firestore = inject(Firestore);

  async sendMessage(roomId: string, text: string) {
    const user = this.auth.currentUser;
    if (!user) return;

    await addDoc(collection(this.firestore, `chatrooms/${roomId}/messages`), {
      senderId: user.uid,
      text,
      timestamp: new Date(),
      seenBy: [user.uid]
    });
    await updateDoc(doc(this.firestore, `chatrooms/${roomId}`), {
      lastMessage: text,
      lastMessageTimestamp: new Date(),
      lastMessageSeenBy: [user.uid]
    });
  }

  getRoomMessages(roomId: string): Observable<Message[]> {
    const messagesRef = collection(this.firestore, `chatrooms/${roomId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<Message[]>;
  }

  getSender(userId: string): Observable<UserProfile | undefined> {
    const userRef = doc(this.firestore, Collection.USERS, userId);
    return docData(userRef) as Observable<UserProfile>;
  }
}
