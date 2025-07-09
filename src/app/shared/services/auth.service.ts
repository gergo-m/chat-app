import { inject, Injectable } from "@angular/core";
import {
    Auth,
    browserSessionPersistence,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    user,
    User
} from '@angular/fire/auth';
import { GithubAuthProvider, setPersistence, updateProfile } from "firebase/auth";
import { Observable } from 'rxjs';
import { Collection, ProviderType } from "../util/constant";
import { doc, getDoc, setDoc } from "@firebase/firestore";
import { Firestore } from "@angular/fire/firestore";

@Injectable({providedIn: 'root'})
export class AuthService {
  auth = inject(Auth);
  firestore = inject(Firestore);
  user$: Observable<User | null>;

  constructor() {
    this.setSessionStoragePersistence();
    this.user$ = user(this.auth);
  }

  private async setSessionStoragePersistence(): Promise<void> {
    await setPersistence(this.auth, browserSessionPersistence);
  }

  async register(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return userCredential;
    } catch (error) {
      console.error("User register error:", error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    return userCredential;
  }

  logout() {
    return signOut(this.auth);
  }
  
  async loginWithProvider(providerType: ProviderType) {
    let provider;
    switch (providerType) {
      case ProviderType.GOOGLE:
        provider = new GoogleAuthProvider();
        break;
      case ProviderType.GITHUB:
        provider = new GithubAuthProvider();
        break;
      default:
        provider = ProviderType.INVALID;
        break;
    }
    if (typeof provider === 'string') return;
    const user = await signInWithPopup(this.auth, provider);
    const userRef = await getDoc(doc(this.firestore, `users/${user.user.uid}`));
    if (!userRef.exists()) {
      const uid = user.user.uid;
      const email = user.user.email;
      const name = !user.user.displayName || user.user.displayName === email ? email?.substring(0, email.indexOf('@')) : user.user.displayName;
      await setDoc(doc(this.firestore, Collection.USERS, uid), {
        name, email, createdAt: new Date()
      });
      await updateProfile(user.user, { displayName: name });
    }
  }
}
