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
import { setPersistence } from "firebase/auth";
import { Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
export class AuthService {
  auth = inject(Auth);
  user$: Observable<User | null>;

  constructor(private firebaseAuth: Auth) {
    this.setSessionStoragePersistence();
    this.user$ = user(this.firebaseAuth);
  }

  private async setSessionStoragePersistence(): Promise<void> {
    await setPersistence(this.firebaseAuth, browserSessionPersistence);
  }

  async register(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.firebaseAuth, email, password);
      return userCredential;
    } catch (error) {
      console.error("User register error:", error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(this.firebaseAuth, email, password);
    return userCredential;
  }

  // Logout current user
  logout() {
    return signOut(this.firebaseAuth);
  }
  
  async googleLogin(): Promise<void> {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.firebaseAuth, provider);
      const user = result.user;
      if (!user) {
        throw new Error('Google-Login error');
      }
    } catch (error) {
      console.error('Google-Login error:', error);
      throw error;
    }
  }
}
