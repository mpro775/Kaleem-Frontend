// src/features/chat/socket/types.ts
import type { ChatMessage } from "@/entities/message/model/types";
export type WsEvent =
  | { type: "message:new"; payload: ChatMessage }
  | { type: "session:update"; payload: { sessionId: string } };
