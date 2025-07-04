import { inject, Injectable } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { getDatabase, onDisconnect, onValue, ref, set } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  auth = inject(Auth);

  constructor() {
    user(this.auth).subscribe(currentUser => {
      if (currentUser) {
        this.setPresence(currentUser.uid);
      }
    });
  }

  setPresence(uid: string) {
    const db = getDatabase();
    const userStatusDatabaseRef = ref(db, '/status/' + uid);
    const isOfflineForDatabase = {
      state: 'offline',
      last_changed: Date.now(),
    };
    const isOnlineForDatabase = {
      state: 'online',
      last_changed: Date.now(),
    };
    const connectedRef = ref(db, '.info/connected');
    onValue(connectedRef, (snapshot) => {
      if (snapshot.val() == false) return;

      onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(() => {
        set(userStatusDatabaseRef, isOnlineForDatabase);
      });
    });
    console.log("done");
    console.log(uid, userStatusDatabaseRef.toString());
  }
}
