import { User } from "@angular/fire/auth";

export interface Message {
    id?: string;
    author: User;
    content: string;
}