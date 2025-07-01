import { User } from "@angular/fire/auth";

export interface Message {
    id?: string;
    senderId: string;
    text: string;
    timestamp: Date;
    seenBy: string[];
}