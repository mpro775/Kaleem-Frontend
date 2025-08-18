import { useCallback, useEffect, useState } from "react";
import ConversationsSidebar from "../../components/Chat/ConversationsSidebar";
import ConversationsList from "../../components/Chat/ConversationsList";
import ChatWindow from "../../components/Chat/ChatWindow";
import ChatInput from "../../components/Chat/ChatInput";
import { useConversations } from "../../hooks/useConversations";
import { useChatMessages } from "../../hooks/useChatMessages";
import {
  getSessionDetails,
  setSessionHandover,
  rateMessage,
} from "../../api/messages";
import { Box, FormControlLabel, Switch, Typography } from "@mui/material";
import type { ChannelType, ChatMessage } from "../../types/chat";
import { useAuth } from "../../context/AuthContext";
import { sendAgentMessage } from "../../api/messageagent";
import { useChatWebSocket } from "../../hooks/useChatWebSocket";
import FeedbackDialog from "../../components/Chat/FeedbackDialog";

export default function ConversationsPage() {
  const [selectedChannel, setChannel] = useState<"" | ChannelType>("");
  const { user } = useAuth();
  const MERCHANT_ID = user?.merchantId ?? "";
  console.log("Merchant ID:", MERCHANT_ID);
  const { sessions, loading: loadingSessions } = useConversations(
    MERCHANT_ID,
    selectedChannel || undefined
  );
  const [selectedSession, setSelectedSession] = useState<string>();
  const { messages: initialMessages, loading: loadingMessages } =
    useChatMessages(selectedSession);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<ChatMessage | null>(null);
  const [handover, setHandover] = useState(false);
  useEffect(() => {
    if (selectedSession) {
      getSessionDetails(selectedSession).then((session) => {
        setHandover(session.handoverToAgent ?? false);
      });
    }
  }, [selectedSession]);
  // دالة التبديل
  async function handleToggleHandover(checked: boolean) {
    if (!selectedSession) return;
    await setSessionHandover(selectedSession, checked);
    setHandover(checked);
  }
  useEffect(() => {
    setMessages(initialMessages || []);
  }, [initialMessages]);
  const handleRealtimeMessage = useCallback(
    (msg: ChatMessage) => {
      // اختياري: تأكد أن الرسالة ليست مكررة (لو عندك مشكلة تكرار بسبب إعادة التحميل)
      setMessages((prev) => [...prev, msg]);
    },
    [setMessages]
  );

  useChatWebSocket(selectedSession, handleRealtimeMessage);
  const handleRate = async (msg: ChatMessage, rating: number) => {
    if (!msg._id || !selectedSession) return;

    if (rating === 0) {
      setFeedbackMsg(msg);
      setFeedbackOpen(true);
    } else {
      // تقييم إيجابي
      await rateMessage(selectedSession, msg._id, rating);
      setMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? { ...m, rating } : m))
      );
    }
  };

  // عند إرسال التعليق
  const handleSubmitFeedback = async (feedback: string) => {
    if (!feedbackMsg || !selectedSession) return;
    await rateMessage(selectedSession, feedbackMsg._id!, 0, feedback);
    setMessages((prev) =>
      prev.map((m) =>
        m._id === feedbackMsg._id ? { ...m, rating: 0, feedback } : m
      )
    );
    setFeedbackOpen(false);
    setFeedbackMsg(null);
  };
  async function handleSend(text: string) {
    if (!selectedSession || !user) return;

    const session = sessions.find((s) => s.sessionId === selectedSession);
    if (!session) return;

    // استخدم الدالة الجديدة إذا الموظف يرد (role = agent)
    await sendAgentMessage({
      merchantId: MERCHANT_ID,
      sessionId: selectedSession,
      channel: session.channel,
      messages: [{ role: "agent", text }],
    });

    // إذا أردت دعم الإرسال من العميل نفسه (مثلاً لايف شات على الويب):
    // await sendMessage({
    //   merchantId: user.merchantId,
    //   sessionId: selectedSession,
    //   channel: session.channel,
    //   messages: [{ role: "customer", text }],
    // });

    // إعادة جلب الرسائل أو تحديث واجهة الشات
  }

  return (
    <Box display="flex" height="100vh">
      <Box width={320} borderRight="1px solid #eee">
        <ConversationsSidebar
          selectedChannel={selectedChannel}
          setChannel={setChannel}
        />
        <ConversationsList
          sessions={sessions}
          loading={loadingSessions}
          onSelect={setSelectedSession}
          selectedId={selectedSession}
        />
      </Box>

      <Box display="flex" flexDirection="column" flex={1} minWidth={0}>
        {/* Header: العنوان + السويتش */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          p={2}
          borderBottom="1px solid #eee"
          minHeight={56}
        >
          <Typography fontWeight={700} fontSize={18}>
            {selectedSession ? `المحادثة: ${selectedSession}` : "اختر محادثة"}
          </Typography>
          {selectedSession && (
            <FormControlLabel
              control={
                <Switch
                  checked={handover}
                  onChange={(_, checked) => handleToggleHandover(checked)}
                  color="primary"
                />
              }
              label={
                handover ? "تم تسليمها للموظف (إيقاف البوت)" : "البوت يعمل"
              }
              labelPlacement="start"
            />
          )}
        </Box>

        {/* نافذة الرسائل */}
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
        {/* إدخال الرسالة */}
        {selectedSession && <ChatInput onSend={handleSend} />}
      </Box>
    </Box>
  );
}
