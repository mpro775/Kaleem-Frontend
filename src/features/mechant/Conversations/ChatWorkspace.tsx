// src/widgets/chat/ChatWorkspace.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import {
  useConversations,
  useSessionDetails,
  useMessages,
} from "@/features/mechant/Conversations/model/queries";
import {
  useHandover,
  useRate,
  useSendAgentMessage,
} from "@/features/mechant/Conversations/model/mutations";
import { useChatSocket } from "@/features/mechant/Conversations/socket/useChatSocket";
import type { ChatMessage as UiChatMessage, ChannelType } from "@/features/mechant/Conversations/type";
import type { ChatMessage as EntityChatMessage } from "@/features/mechant/Conversations/type";
import type { WsEvent } from "@/features/mechant/Conversations/socket/types";
import Header from "@/features/mechant/Conversations/ui/Header";
import Sidebar from "@/features/mechant/Conversations/ui/ConversationsSidebar"; // ConversationsSidebar
import SessionsList from "@/features/mechant/Conversations/ui/ConversationsList"; // ConversationsList
import ChatWindow from "@/features/mechant/Conversations/ui/ChatWindow";
import ChatInput from "@/features/mechant/Conversations/ui/ChatInput";
import FeedbackDialog from "@/features/mechant/Conversations/ui/FeedbackDialog";

function dedupeAppend(list: UiChatMessage[], msg: UiChatMessage) {
  if (msg._id && list.some((m) => m._id === msg._id)) return list;
  return [...list, msg];
}

export default function ChatWorkspace({ merchantId }: { merchantId: string }) {
  const [selectedChannel, setChannel] = useState<"" | ChannelType>("");
  const [selectedSession, setSelectedSession] = useState<string>();
  const { data: sessions, isLoading: loadingSessions } = useConversations(
    merchantId,
    selectedChannel || undefined
  );
  const { data: sessionDetails } = useSessionDetails(selectedSession);
  const { data: initialMessages, isLoading: loadingMessages } =
    useMessages(selectedSession);

  const [messages, setMessages] = useState<UiChatMessage[]>([]);
  useEffect(() => {
    setMessages(initialMessages ?? []);
  }, [initialMessages]);

  // WS: أضف الرسائل فورًا
  const toUiMessage = (m: EntityChatMessage): UiChatMessage => ({
    _id: m._id,
    role: m.role === "system" ? "bot" : (m.role as UiChatMessage["role"]),
    text: m.text,
    timestamp: m.timestamp,
    rating: typeof m.rating === "number" ? m.rating : null,
    feedback: m.feedback ?? null,
  });

  const onWsEvent = useCallback(
    (e: WsEvent) => {
      if (e.type === "message:new") {
        setMessages((prev) => dedupeAppend(prev, toUiMessage(e.payload)));
      }
    },
    [selectedSession]
  );
  useChatSocket(selectedSession, onWsEvent);

  // handover
  const { mutateAsync: toggleHandover } = useHandover(selectedSession);
  const handover = sessionDetails?.handoverToAgent ?? false;

  // إرسال الرسالة
  const activeChannel = useMemo(
    () => sessions?.find((s) => s.sessionId === selectedSession)?.channel,
    [sessions, selectedSession]
  );
  const { mutateAsync: sendMsg } = useSendAgentMessage(
    merchantId,
    selectedSession,
    activeChannel
  );

  // التقييم
  const { mutateAsync: rate } = useRate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<UiChatMessage | null>(null);

  const handleRate = async (msg: UiChatMessage, rating: number) => {
    if (!selectedSession || !msg._id) return;
    if (rating === 0) {
      setFeedbackMsg(msg);
      setFeedbackOpen(true);
    } else {
      await rate({ sessionId: selectedSession, messageId: msg._id, rating });
      setMessages((prev) =>
        prev.map((m) =>
          m._id === msg._id ? { ...m, rating: rating as 0 | 1 | -1 } : m
        )
      );
    }
  };

  const handleSubmitFeedback = async (feedback: string) => {
    if (!feedbackMsg || !selectedSession || !feedbackMsg._id) return;
    await rate({
      sessionId: selectedSession,
      messageId: feedbackMsg._id,
      rating: 0,
      feedback,
    });
    setMessages((prev) =>
      prev.map((m) =>
        m._id === feedbackMsg._id ? { ...m, rating: 0, feedback } : m
      )
    );
    setFeedbackOpen(false);
    setFeedbackMsg(null);
  };

  const handleSend = async (payload: {
    text?: string;
    file?: File | null;
    audio?: Blob | null;
  }) => {
    const { text } = payload;
    if (!text || !selectedSession || !activeChannel) return;
    await sendMsg(text);
    // اختياري: إظهار الرسالة محليًا للتجاوب الفوري (optimistic)
    const now = new Date().toISOString();
    setMessages((prev) => [
      ...prev,
      {
        _id: undefined,
        role: "agent",
        text,
        timestamp: now,
      },
    ]);
  };

  const loading = loadingSessions || loadingMessages;

  return (
    <Box display="flex" height="100vh">
      {/* الشريط الجانبي */}
      <Box width={320} borderRight="1px solid #eee">
        <Sidebar selectedChannel={selectedChannel} setChannel={setChannel} />
        <SessionsList
          sessions={sessions ?? []}
          loading={loadingSessions}
          onSelect={setSelectedSession}
          selectedId={selectedSession}
        />
      </Box>

      {/* منطقة المحادثة */}
      <Box display="flex" flexDirection="column" flex={1} minWidth={0}>
        <Header
          selectedSession={selectedSession}
          handover={handover}
          onToggleHandover={(v) => toggleHandover(v)}
        />

        {loading && (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {!loading && (
          <>
            <Box flex={1} minHeight={0} sx={{ overflowY: "auto" }}>
              <ChatWindow
                messages={messages}
                loading={loadingMessages}
                onRate={handleRate}
              />
            </Box>

            <FeedbackDialog
              open={feedbackOpen}
              onClose={() => setFeedbackOpen(false)}
              onSubmit={handleSubmitFeedback}
            />

            {selectedSession && <ChatInput onSend={handleSend} />}
          </>
        )}
      </Box>
    </Box>
  );
}
