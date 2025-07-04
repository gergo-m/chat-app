export interface Room {
    id?: string;
    name: string;
    type: 'group' | 'private';
    members: string[];
    createdAt: Date;
    lastMessage: string;
    lastMessageTimestamp: { seconds: number, nanoseconds: number } | Date | string;
    visibility: 'public' | 'private' | 'password';
    password?: string;
}