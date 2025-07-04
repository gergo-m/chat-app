import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), provideFirebaseApp(() => initializeApp({ projectId: "chat-app-5efc6", appId: "1:89212423848:web:350da59ace7057e9e4fc9d", storageBucket: "chat-app-5efc6.firebasestorage.app", apiKey: "AIzaSyDuq0m-8_xnnr27r9Jf0nExMRxAliWMpfU", authDomain: "chat-app-5efc6.firebaseapp.com", messagingSenderId: "89212423848", databaseURL: "https://chat-app-5efc6-default-rtdb.europe-west1.firebasedatabase.app" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideStorage(() => getStorage())
  ]
};
