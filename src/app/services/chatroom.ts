import { inject, Injectable } from '@angular/core';
import { collection, collectionData, deleteDoc, doc, Firestore, getDoc, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Room } from '../model/chatroom';

@Injectable({
  providedIn: 'root'
})
export class Chatroom {
  firestore = inject(Firestore);

  constructor() { }

  async createChatroom(name: string, type: 'group' | 'private', members: string[]) {
    const chatroomRef = doc(collection(this.firestore, 'chatrooms'));
    await setDoc(chatroomRef, {
      name, type, members,
      createdAt: new Date(),
      lastMessage: '',
      lastMessageTimestamp: new Date()
    });
    return chatroomRef.id;
  }

  getUserRooms(userId: string): Observable<Room[]> {
    const q = query(
      collection(this.firestore, `chatrooms`),
      where('members', 'array-contains', userId)
    );
    return collectionData(q, { idField: 'id' }) as Observable<Room[]>;
  }

  async updateRoomName(roomId: string, newName: string) {
    await updateDoc(doc(this.firestore, `chatrooms/${roomId}`), { name: newName });
  }

  async deleteRoom(roomId: string) {
    await deleteDoc(doc(this.firestore, `chatrooms/${roomId}`));
  }

  async getOrCreatePrivateRoom(user1: string, user2: string) {
    const sortedIds = [user1, user2].sort();
    const roomId = `private_${sortedIds[0]}_${sortedIds[1]}`;

    const roomRef = doc(this.firestore, `chatrooms/${roomId}`);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      await setDoc(roomRef, {
        type: 'private',
        members: [user1, user2],
        createdAt: new Date()
      });
    }
    return roomId;
  }
}
