import { inject, Injectable } from '@angular/core';
import { collection, collectionData, deleteDoc, doc, docData, Firestore, getDoc, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { combineLatest, map, Observable } from 'rxjs';
import { Room } from '../model/chatroom';
import { Collection, Visibility } from '../util/constant';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class ChatroomService {
  private firestore = inject(Firestore);
  auth = inject(Auth);

  async createChatroom(name: string, type: 'group' | 'private', visibility: Visibility, password: string, members: string[]) {
    const chatroomRef = doc(collection(this.firestore, Collection.CHATROOMS));
    await setDoc(chatroomRef, {
      name, type, members,
      ownerId: this.auth.currentUser?.uid,
      createdAt: new Date(),
      lastMessage: '',
      lastMessageTimestamp: new Date(),
      visibility, password
    });
    return chatroomRef.id;
  }

  getChatroom(roomId: string): Observable<Room | undefined> {
    const chatroomRef = doc(this.firestore, Collection.CHATROOMS, roomId);
    return docData(chatroomRef, { idField: 'id' }) as Observable<Room>;
  }

  getUserRooms(userId: string): Observable<Room[]> {
    const q = query(
      collection(this.firestore, `chatrooms`),
      where('members', 'array-contains', userId)
    );
    return collectionData(q, { idField: 'id' }) as Observable<Room[]>;
  }

  async updateRoom(roomId: string, newName: string, newMembers: string[]) {
    await updateDoc(doc(this.firestore, `chatrooms/${roomId}`), { name: newName, members: newMembers });
  }

  async updateRoomSeenBy(roomId: string, newLastMessageSeenBy: string[]) {
    await updateDoc(doc(this.firestore, `chatrooms/${roomId}`), { lastMessageSeenBy: newLastMessageSeenBy });
  }

  async deleteRoom(roomId: string) {
    await deleteDoc(doc(this.firestore, `chatrooms/${roomId}`));
  }

  getParticipantNames(userIds: string[] | undefined): Observable<string[]> {
    if (!userIds) return new Observable<string[]>();
    const userObservables = userIds.map(uid =>
      docData(doc(this.firestore, Collection.USERS, uid))
    );

    return combineLatest(userObservables).pipe(
      map(users => users.map(user => user?.['name'] || 'Unknown'))
    );
  }

  async getOrCreatePrivateRoom(user1: string, user2: string) {
    const sortedIds = [user1, user2].sort();
    const roomId = `private_${sortedIds[0]}_${sortedIds[1]}`;

    const roomRef = doc(this.firestore, `chatrooms/${roomId}`);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      await setDoc(roomRef, {
        name: 'Private chat',
        type: 'private',
        members: [user1, user2],
        createdAt: new Date(),
        lastMessage: '',
        lastMessageTimestamp: new Date(),
        visibility: 'private',
        password: ''
      });
    }
    return roomId;
  }

  async hasPrivateRoom(user1: string | undefined, user2: string) {
    const sortedIds = [user1, user2].sort();
    const roomId = `private_${sortedIds[0]}_${sortedIds[1]}`;
    const roomRef = doc(this.firestore, `chatrooms/${roomId}`);
    const roomSnap = await getDoc(roomRef);
    return roomSnap.exists();
  }

  async isUserMember(roomId: string, userId: string): Promise<boolean> {
    const roomDocRef = doc(this.firestore, Collection.CHATROOMS, roomId);
    const roomSnap = await getDoc(roomDocRef);
    if (!roomSnap.exists()) return false;
    const roomData = roomSnap.data() as { members?: string[] };
    return Array.isArray(roomData.members) && roomData.members.includes(userId);
  }
}
