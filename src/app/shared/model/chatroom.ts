import { Visibility } from "../util/constant";

export interface Room {
  id?: string;
  name: string;
  type: 'group' | 'private';
  members: string[];
  ownerId: string;
  createdAt: Date;
  lastMessage: string;
  lastMessageTimestamp: { seconds: number, nanoseconds: number } | Date | string;
  lastMessageSeenBy: string[];
  visibility: Visibility;
  password?: string;
  otherUid: string;
}