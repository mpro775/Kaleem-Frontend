// src/entities/session/model/types.ts
export type ChannelType = "whatsapp" | "telegram" | "webchat" | "instagram" | "other";

export type SessionSummary = {
  sessionId: string;
  channel: ChannelType;
  lastMessageAt: string;
  customerName?: string;
  unread?: number;
};

export type SessionDetails = {
  sessionId: string;
  channel: ChannelType;
  handoverToAgent?: boolean;
};
