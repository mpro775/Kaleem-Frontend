// src/widgets/chat/ChatWorkspace.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
  Chip,
  Tooltip,
} from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import SignalCellularAltRoundedIcon from "@mui/icons-material/SignalCellularAltRounded";
import SignalCellularConnectedNoInternet0BarRoundedIcon from "@mui/icons-material/SignalCellularConnectedNoInternet0BarRounded";
import { useErrorHandler } from "@/shared/errors";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";

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
import type {
  ChatMessage as UiChatMessage,
  ChatMessage as EntityChatMessage,
  ChannelType,
} from "@/features/mechant/Conversations/type";
import { useChatSocket } from "@/features/mechant/Conversations/socket/useChatSocket";

import Header from "@/features/mechant/Conversations/ui/Header";
import Sidebar from "@/features/mechant/Conversations/ui/ConversationsSidebar";
import SessionsList from "@/features/mechant/Conversations/ui/ConversationsList";
import ChatWindow from "@/features/mechant/Conversations/ui/ChatWindow";
import ChatInput from "@/features/mechant/Conversations/ui/ChatInput";
import FeedbackDialog from "@/features/mechant/Conversations/ui/FeedbackDialog";

type MobileView = "list" | "chat";

function dedupeAppend(list: UiChatMessage[], msg: UiChatMessage) {
  if (msg._id && list.some((m) => m._id === msg._id)) return list;
  return [...list, msg];
}

export default function ChatWorkspace({ merchantId }: { merchantId: string }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { handleError } = useErrorHandler();

  // حفظ اختيارات المستخدم
  const [selectedChannel, setChannel] = useLocalStorage<"" | ChannelType>(
    "conv_selected_channel",
    ""
  );
  const [selectedSession, setSelectedSession] = useLocalStorage<
    string | undefined
  >("conv_selected_session", undefined);
  const [mobileView, setMobileView] = useState<MobileView>("list");

  // حالة الشبكة
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const { mutateAsync: rate, isPending: ratingLoading } = useRate();
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

  const toUiMessage = (m: EntityChatMessage): UiChatMessage => ({
    _id: m._id,
    role: m.role === "system" ? "bot" : (m.role as UiChatMessage["role"]),
    text: m.text,
    timestamp: m.timestamp,
    rating: typeof m.rating === "number" ? m.rating : null,
    feedback: m.feedback ?? null,
  });

  useChatSocket(
    selectedSession,
    (msg) => {
      setMessages((prev) => dedupeAppend(prev, toUiMessage(msg)));
    },
    "agent",
    merchantId
  );

  const { mutateAsync: toggleHandover } = useHandover(selectedSession);
  const handover = sessionDetails?.handoverToAgent ?? false;

  const activeChannel = useMemo(() => {
    if (!sessions || !Array.isArray(sessions)) return undefined;
    return sessions.find((s) => s.sessionId === selectedSession)?.channel;
  }, [sessions, selectedSession]);

  const { mutateAsync: sendMsg } = useSendAgentMessage(
    merchantId,
    selectedSession,
    activeChannel
  );

  // تقييم + Feedback
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<UiChatMessage | null>(null);
  const handleRate = async (msg: UiChatMessage, rating: number) => {
    try {
      if (rating === 0) {
        if (!selectedSession) return handleError("اختر جلسة أولاً");
        if (!msg._id) return handleError("انتظر مزامنة الرسالة من الخادم.");
        setFeedbackMsg(msg);
        setFeedbackOpen(true);
        return;
      }
      if (!selectedSession || !msg._id) return;
      await rate({ sessionId: selectedSession, messageId: msg._id, rating });
      setMessages((prev) =>
        prev.map((m) =>
          m._id === msg._id ? { ...m, rating: rating as 0 | 1 | -1 } : m
        )
      );
    } catch (e) {
      handleError(e);
    }
  };
  const handleSubmitFeedback = async (feedback: string) => {
    if (!feedbackMsg || !selectedSession || !feedbackMsg._id) {
      handleError("لا يمكن إرسال الملاحظة.");
      return;
    }
    try {
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
    } catch (e) {
      handleError(e);
    }
  };

  // إرسال
  const handleSend = async (payload: {
    text?: string;
    file?: File | null;
    audio?: Blob | null;
  }) => {
    const { text } = payload;
    if (!text || !selectedSession || !activeChannel) return;
    try {
      await sendMsg(text);
      setMessages((prev) => [
        ...prev,
        {
          _id: undefined,
          role: "agent",
          text,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      handleError(e);
    }
  };

  const loading = loadingSessions || loadingMessages;

  // شريط علوي للجوال
  const MobileAppBar = (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ minHeight: "56px !important", gap: 1 }}>
        {mobileView === "chat" ? (
          <IconButton
            edge="start"
            onClick={() => setMobileView("list")}
            aria-label="رجوع"
          >
            <ArrowBackIosNewRoundedIcon />
          </IconButton>
        ) : (
          <Box sx={{ width: 40 }} /> // placeholder
        )}
        <Typography variant="h6" sx={{ fontWeight: 800 }} noWrap>
          {mobileView === "chat"
            ? selectedSession
              ? `جلسة: ${selectedSession}`
              : "محادثة"
            : "المحادثات"}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Tooltip title={online ? "متصل" : "غير متصل"}>
          <Chip
            size="small"
            variant="outlined"
            color={online ? "success" : "warning"}
            icon={
              online ? (
                <SignalCellularAltRoundedIcon />
              ) : (
                <SignalCellularConnectedNoInternet0BarRoundedIcon />
              )
            }
            label={online ? "متصل" : "غير متصل"}
          />
        </Tooltip>
      </Toolbar>
    </AppBar>
  );

  // ===== الجوال: شاشتان =====
  if (isMobile) {
    if (mobileView === "list") {
      return (
        <Box
          sx={{
            height: "100svh",
            display: "flex",
            flexDirection: "column",
            bgcolor: theme.palette.background.default,
          }}
        >
          {MobileAppBar}

          {/* Tabs القنوات */}
          <Tabs
            value={selectedChannel}
            onChange={(_, v) => setChannel(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
          >
            <Tab value="" label="الكل" />
            <Tab value="whatsapp" label="واتساب" />
            <Tab value="telegram" label="تيليجرام" />
            <Tab value="webchat" label="ويب شات" />
          </Tabs>

          <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            <SessionsList
              sessions={sessions ?? []}
              loading={loadingSessions}
              selectedId={selectedSession}
              onSelect={(id) => {
                setSelectedSession(id);
                setMobileView("chat");
              }}
              enableSearch // 👈 جديد
            />
          </Box>
        </Box>
      );
    }

    // شاشة المحادثة
    return (
      <Box
        sx={{
          height: "100svh",
          display: "flex",
          flexDirection: "column",
          bgcolor: theme.palette.background.default,
        }}
      >
        {MobileAppBar}

        {loading ? (
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
        ) : (
          <>
            <Header
              selectedSession={selectedSession}
              handover={handover}
              onToggleHandover={(v) => toggleHandover(v)}
              onBack={() => setMobileView("list")}
            />

            <Box
              sx={{ flex: 1, minHeight: 0, overflowY: "auto", bgcolor: "#fff" }}
            >
              <ChatWindow
                messages={messages}
                loading={loadingMessages}
                onRate={handleRate}
              />
            </Box>

            {!!selectedSession && (
              <Box
                sx={{
                  position: "sticky",
                  bottom: 0,
                  bgcolor: theme.palette.background.paper,
                  borderTop: `1px solid ${theme.palette.divider}`,
                  pb: "env(safe-area-inset-bottom)",
                }}
              >
                <ChatInput onSend={handleSend} />
              </Box>
            )}
          </>
        )}

        <FeedbackDialog
          open={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          onSubmit={handleSubmitFeedback}
          loading={ratingLoading}
        />
      </Box>
    );
  }

  // ===== الديسكتوب =====
  return (
    <Box
      display="flex"
      sx={{ height: "100svh", bgcolor: theme.palette.background.default }}
    >
      <Box
        sx={{
          width: 320,
          borderRight: "1px solid #eee",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <Sidebar selectedChannel={selectedChannel} setChannel={setChannel} />
        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          <SessionsList
            sessions={sessions ?? []}
            loading={loadingSessions}
            onSelect={setSelectedSession}
            selectedId={selectedSession}
            enableSearch
          />
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" flex={1} minWidth={0}>
        <Header
          selectedSession={selectedSession}
          handover={handover}
          onToggleHandover={(v) => toggleHandover(v)}
        />
        {loading ? (
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
        ) : (
          <>
            <Box
              flex={1}
              minHeight={0}
              sx={{ overflowY: "auto", bgcolor: "#fff" }}
            >
              <ChatWindow
                messages={messages}
                loading={loadingMessages}
                onRate={handleRate}
              />
            </Box>
            {selectedSession && <ChatInput onSend={handleSend} />}
          </>
        )}
      </Box>

      <FeedbackDialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        onSubmit={handleSubmitFeedback}
        loading={ratingLoading}
      />
    </Box>
  );
}
