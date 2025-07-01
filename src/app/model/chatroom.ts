export interface Room {
    id?: string;
    name: string;
    type: 'group' | 'private';
    members: string[];
    createdAt: Date;
    lastMessage: string;
    lastMessageTimestamp: Date;
}