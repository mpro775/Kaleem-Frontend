import axios from "@/shared/api/axios"; // تأكد من مسار الاستيراد الصحيح
import type {
  ChannelType,
  ChatMessage,
  ConversationSession,
} from "@/features/mechant/Conversations/type";

export async function rateMessage(
  sessionId: string,
  messageId: string,
  rating: number,
  feedback?: string
) {
  return axios.patch(
    `/messages/session/${sessionId}/messages/${messageId}/rate`,
    { rating, feedback }
  );
}
export async function fetchConversations(
  merchantId: string,
  channel?: ChannelType
): Promise<ConversationSession[]> {
  const { data } = await axios.get<{ data: ConversationSession[] }>(
    "/messages",
    {
      params: { merchantId, channel },
    }
  );
  return data.data;
}

export async function fetchSessionMessages(
  sessionId: string
): Promise<ChatMessage[]> {
  const { data } = await axios.get<ConversationSession>(
    `/messages/session/${sessionId}`
  );
  return data.messages;
}

export async function sendMessage(payload: {
  merchantId: string;
  sessionId: string;
  channel: ChannelType;
  messages: Array<{ role: "customer" | "bot"; text: string }>;
}) {
  // اجلب رابط الـ webhook من الإعدادات أو ثبته مؤقتًا
  const webhookUrl = `/webhooks/incoming/${payload.merchantId}`;
  return axios.post(webhookUrl, {
    from: payload.sessionId,
    merchantId: payload.merchantId,
    text: payload.messages[0].text,
    channel: payload.channel,
    messages: payload.messages,
    // أضف customerName لو متوفر
  });
}

export async function getSessionDetails(sessionId: string) {
  const { data } = await axios.get(`/messages/session/${sessionId}`);
  return data;
}
export async function setSessionHandover(sessionId: string, handover: boolean) {
  return axios.patch(`/messages/session/${sessionId}/handover`, {
    handoverToAgent: handover,
  });
}
