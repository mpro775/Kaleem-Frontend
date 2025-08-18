// File: src/api/kleem.ts
// ملاحظة: تأكد من صحة المسار
import type { AxiosError } from "axios";
import axiosInstance from "./axios";
import axios from "axios";

/* =======================
   Types / Interfaces
   ======================= */

export type KleemRole = "user" | "bot";

export interface KleemMessage {
  role: KleemRole;
  text: string;
  rating?: 0 | 1 | null;
  feedback?: string | null;
  metadata?: Record<string, unknown>;
  timestamp?: string; // اختياري إن أرجعته الـAPI
}

export interface KleemSource {
  id: string | number; // Qdrant id قد يكون string/number
  question?: string;
  answer?: string;
  score?: number;
}

export interface KleemSendRequest {
  text: string;
  metadata?: Record<string, unknown>;
}

export type KleemSendResponse =
  | { status: "queued" }
  | { reply: string; msgIdx: number; sources?: KleemSource[] };

export interface KleemRateRequest {
  msgIdx: number;
  rating: 0 | 1;
  feedback?: string;
}

export interface KleemRateResponse {
  status: "ok";
}

export interface KleemSessionResponse {
  sessionId: string;
  messages: KleemMessage[];
}

/* =======================
   Axios instance
   ======================= */

function parseAxiosError(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const aerr = err as AxiosError<{ message?: string }>;
    const msg =
      aerr.response?.data?.message ||
      aerr.response?.statusText ||
      aerr.message ||
      "Request failed";
    return new Error(msg);
  }
  return err instanceof Error ? err : new Error("Unknown error");
}

/* =======================
   Session id helper
   ======================= */

export function getKleemSessionId(): string {
  const KEY = "kleem-session-id";
  let s = localStorage.getItem(KEY);
  if (!s) {
    s = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    localStorage.setItem(KEY, s);
  }
  return s;
}

/* =======================
   API functions
   ======================= */

export async function sendKleemMessage(
  text: string,
  metadata?: Record<string, unknown>
): Promise<KleemSendResponse> {
  const sessionId = getKleemSessionId();
  const payload: KleemSendRequest = { text, metadata };
  try {
    const { data } = await axiosInstance.post<KleemSendResponse>(
      `/kleem/chat/${sessionId}/message`,
      payload
    );
    return data;
  } catch (err) {
    throw parseAxiosError(err);
  }
}

export async function rateKleemMessage(
  msgIdx: number,
  rating: 0 | 1,
  feedback?: string
): Promise<KleemRateResponse> {
  const sessionId = getKleemSessionId();
  const payload: KleemRateRequest = { msgIdx, rating, feedback };
  try {
    const { data } = await axiosInstance.post<KleemRateResponse>(
      `/kleem/chat/${sessionId}/rate`,
      payload
    );
    return data;
  } catch (err) {
    throw parseAxiosError(err);
  }
}

// (اختياري) للاستعلام عن الجلسة عند استخدام Webhook غير متزامن + polling
export async function fetchKleemSession(): Promise<KleemSessionResponse> {
  const sessionId = getKleemSessionId();
  try {
    const { data } = await axiosInstance.get<KleemSessionResponse>(
      `/kleem/chat/${sessionId}`
    );
    return data;
  } catch (err) {
    throw parseAxiosError(err);
  }
}
