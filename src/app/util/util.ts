import { User } from "@angular/fire/auth";
import { doc, docData, Firestore } from "@angular/fire/firestore";
import { Observable, of, switchMap } from "rxjs";
import { UserProfile } from "../model/user";
import { Collection } from "./constant";

export function getTimestampMillis(timestamp: { seconds: number; nanoseconds: number } | Date | string): number {
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    return timestamp.seconds * 1000 + Math.floor((timestamp.nanoseconds || 0) / 1e6);
  } else if (timestamp instanceof Date) {
    return timestamp.getTime();
  } else if (typeof timestamp === 'string') {
    const parsed = Date.parse(timestamp);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export function formatTimestamp(timestamp: { seconds: number; nanoseconds: number } | Date | string) {
  const millis = getTimestampMillis(timestamp);
  const date = new Date(millis);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatTimestampFull(timestamp: { seconds: number; nanoseconds: number } | Date | string) {
  const millis = getTimestampMillis(timestamp);
  const date = new Date(millis);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const monthName = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate().toString().padStart(2, '0');
  const dayName = date.toLocaleString('default', { weekday: 'short' });
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const now = new Date();
  if (date.getFullYear() !== now.getFullYear()) return `${year} ${monthName} ${day} at ${hours}:${minutes}`;
  if ((date.getDay() > now.getDay()) && Math.abs(now.getDate() - date.getDate()) < 7) return `${dayName} at ${hours}:${minutes}`;
  if (date.getMonth() === now.getMonth() && date.getDate() === now.getDate()) return `${hours}:${minutes}`;
  return `${monthName} ${day} at ${hours}:${minutes}`;
}

export function displayDateAbove(timestamp1: { seconds: number; nanoseconds: number } | Date | string, timestamp2: { seconds: number; nanoseconds: number } | Date | string): boolean {
  const date1 = new Date(getTimestampMillis(timestamp1));
  const date2 = new Date(getTimestampMillis(timestamp2));
  if (date1.getFullYear() === date2.getFullYear()
    && date1.getMonth() === date2.getMonth()
    && date1.getDate() === date2.getDate()) {
      return Math.abs(date1.getHours() - date2.getHours()) >= 5
  }
  return true;
}

export function getCurrentUser(user$: Observable<User | null>, firestore: Firestore) {
  return user$.pipe(
    switchMap(currentUser => currentUser
      ? docData(doc(firestore, Collection.USERS, currentUser.uid)) as Observable<UserProfile>
      : of(null)
    )
  );
}
