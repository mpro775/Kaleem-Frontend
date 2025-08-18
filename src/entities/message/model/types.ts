export type Role = "customer" | "bot" | "agent" | "system";

export type ChatMessage = {
  _id?: string;
  sessionId: string;
  role: Role;
  text: string;
  createdAt: string;
  rating?: 1 | 0 | -1;
  feedback?: string;
};