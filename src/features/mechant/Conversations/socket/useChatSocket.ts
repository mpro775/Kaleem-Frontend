
// src/features/chat/socket/useChatSocket.ts
import { useEffect, useRef } from "react";
import type { WsEvent } from "./types";

export function useChatSocket(sessionId: string | undefined, onEvent: (e: WsEvent) => void) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    // استبدل URL بendpoint الحقيقي لديك
    const ws = new WebSocket(`${location.origin.replace(/^http/, "ws")}/ws?sessionId=${sessionId}`);
    wsRef.current = ws;

    ws.onmessage = (ev) => {
      try {
        const e: WsEvent = JSON.parse(ev.data);
        onEvent(e);
      } catch {
        /* ignore */
      }
    };
    ws.onclose = () => { /* إعادة اتصال اختياري */ };

    return () => { ws.close(); wsRef.current = null; };
  }, [sessionId, onEvent]);
}
