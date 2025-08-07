export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Message {
  id: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
}