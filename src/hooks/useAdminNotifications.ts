import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import type { AdminNotification } from "../types/notification";

type OnNewMessage = (payload: AdminNotification) => void;

export function useAdminNotifications(onNewMessage: OnNewMessage) {
  useEffect(() => {
    const socket: Socket = io("https://api.kaleem-ai.com", {
      path: "/api/chat",
      query: { sessionId: "admin-panel-XYZ", role: "admin" },
      transports: ["websocket"],
    });

    socket.on("admin_new_message", (payload: AdminNotification) => {
      onNewMessage(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, [onNewMessage]);
}
