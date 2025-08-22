// src/realtime/adminFeed.ts
import { io, Socket } from "socket.io-client";

export function connectAdminFeed(token?: string) {
  const socket: Socket = io(
    `${import.meta.env.VITE_API_BASE_URL}/api/kleem/ws`,
    {
      transports: ["websocket"],
      query: { role: "admin" },
      auth: token ? { token } : undefined,
      withCredentials: true,
    }
  );
  return socket; // استمع للحدث 'admin_new_message'
}
