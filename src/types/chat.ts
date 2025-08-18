// types/chat.ts

export type ChannelType = "whatsapp" | "telegram" | "webchat";

// types/chat.ts
export interface ChatMessage {
  role: "customer" | "bot" | "agent";
  text: string;
  timestamp: string; // ISO date string
  metadata?: Record<string, unknown>;
  _id?: string; // أضف _id لو متوفر من الباك اند
  rating?: number | null; // 0 = سيء، 1 = جيد
  feedback?: string | null; // تعليق التاجر
}

export interface ConversationSession {
  _id: string;
  merchantId: string;
  sessionId: string;
  channel: ChannelType;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}
