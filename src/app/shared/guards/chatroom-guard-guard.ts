import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { Collection } from '../util/constant';
import { Room } from '../model/chatroom';

@Injectable({ providedIn: 'root' })
export class ChatroomGuard implements CanActivate {
  private auth = inject(Auth);
  private router = inject(Router);
  private firestore = inject(Firestore);

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    const roomId = route.params['id'];
    const user = this.auth.currentUser;
    if (!user) return this.router.parseUrl('/login');
    const roomDoc = doc(this.firestore, Collection.CHATROOMS, roomId);
    const roomSnap = await getDoc(roomDoc);
    if (!roomSnap.exists()) {
      return this.router.parseUrl('/');
    }
    const room = roomSnap.data() as Room;

    if (!Array.isArray(room.members) || !room.members.includes(user.uid)) {
      return this.router.parseUrl('/');
    }
    return true;
  }
}
