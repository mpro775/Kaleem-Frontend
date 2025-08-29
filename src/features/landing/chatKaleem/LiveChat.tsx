// src/features/landing/chatKaleem/LiveChat.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { useTheme } from "@mui/material/styles";
import { io, Socket } from "socket.io-client";

import type { ChatMessage } from "./types";
import { KLEEM_COLORS } from "./constants";
import {
  fetchKleemSession,
  rateKleemMessage,
  sendKleemMessage,
} from "@/features/kaleem/api";
import { getKleemSessionId } from "@/features/kaleem/helper";
import ChatInput from "./ChatInput";
import ChatBubble from "./ChatBubble";

const POLL_MS = 3000;
const uid = () =>
  typeof crypto?.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function sameMsgs(a: ChatMessage[], b: ChatMessage[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].from !== b[i].from || a[i].text !== b[i].text) return false;
  }
  return true;
}

interface LiveChatProps {
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
}

function isNearBottom(el: HTMLElement, threshold = 80) {
  return el.scrollHeight - (el.scrollTop + el.clientHeight) < threshold;
}

export default function LiveChat({ messagesContainerRef }: LiveChatProps) {
  const theme = useTheme();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "hello",
      from: "bot",
      text: "👋 مرحباً! أنا كليم. اسألني عن منصتنا أو الباقات أو التجربة المجانية.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [showJump, setShowJump] = useState(false);

  // ✅ حالة “كليم يكتب الآن…”
  const [botTyping, setBotTyping] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // متابعة زر "أحدث الرسائل"
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const onScroll = () => setShowJump(!isNearBottom(el));
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [messagesContainerRef]);

  // حافظ على النزول عند وصول رسالة جديدة
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (isNearBottom(el))
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, messagesContainerRef]);

  // مرجع السوكيت (اختياري لو احتجته لاحقًا)
  const socketRef = useRef<Socket | null>(null);

  // WS أولاً ثم fallback إلى polling
  useEffect(() => {
    const origin =
      import.meta.env.VITE_WS_ORIGIN ?? "https://api.kaleem-ai.com";
    const path = import.meta.env.VITE_WS_PATH ?? "/api/kaleem/ws";
    const sessionId = getKleemSessionId();

    let pollId: ReturnType<typeof setInterval> | null = null;

    const pull = async () => {
      try {
        const session = await fetchKleemSession();
        const raw = Array.isArray(session?.messages) ? session.messages : [];
        const ui: ChatMessage[] = raw.map((m: any, i: number) => ({
          id:
            m.id ??
            m._id ??
            `${m.role}-${m.timestamp ?? i}-${m.text?.length ?? 0}`,
          from: m.role,
          text: m.text,
          rateIdx: m.role === "bot" ? i : undefined,
        }));
        setMessages((prev) => (sameMsgs(prev, ui) ? prev : ui));
      } catch {
        // تجاهل مؤقت
      }
    };

    const startPolling = () => {
      if (pollId) return;
      pollId = setInterval(pull, POLL_MS);
    };
    const stopPolling = () => {
      if (pollId) {
        clearInterval(pollId);
        pollId = null;
      }
    };

    // إنشاء السوكيت
    const socket = io(origin, {
      path,
      transports: ["websocket", "polling"],
      withCredentials: true,
      query: { sessionId, role: "guest" },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelayMax: 5000,
    });
    socketRef.current = socket;

    // مؤشر الكتابة من السيرفر
    socket.on("typing", (p: { sessionId: string; role: "user" | "bot" }) => {
      if (p?.role === "bot") {
        setBotTyping(true);
        // “أمان” فقط لو انقطعت نبضات typing لأي سبب
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setBotTyping(false), 5000);
      }
    });

    socket.on("connect", () => {
      stopPolling();
      pull(); // تزامن أولي
    });

    socket.on("bot_reply", (msg: any) => {
      setBotTyping(false); // أخفِ “يكتب الآن”
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID?.() ?? Date.now().toString(),
          from: "bot",
          text: msg?.text ?? "",
          rateIdx: msg?.msgIdx,
        },
      ]);
    });

    socket.on("disconnect", startPolling);
    socket.on("connect_error", startPolling);
    socket.on("error", startPolling);

    // أول سحبة مباشرة
    pull();

    return () => {
      socket.close();
      socketRef.current = null;
      stopPolling();
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
        typingTimer.current = null;
      }
    };
  }, []);

  const handleSend = useCallback(async (text: string) => {
    setMessages((prev) => [...prev, { id: uid(), from: "user", text }]);
    setLoading(true);
    try {
      await sendKleemMessage(text, {
        page: window.location.pathname,
        sessionId: getKleemSessionId(),
      });
      // لا نُظهر “typing” من الفرونت؛ السيرفر يبثّه فورًا (نبض كل 1.5s)
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { id: uid(), from: "bot", text: "تعذّر جلب الرد الآن. حاول لاحقاً 🙏" },
      ]);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRate = useCallback(async (msgIdx: number, value: 0 | 1) => {
    try {
      await rateKleemMessage(msgIdx, value);
      setMessages((prev) =>
        prev.map((m) =>
          m.rateIdx === msgIdx
            ? {
                ...m,
                text:
                  m.text +
                  (value ? "  (شكراً لتقييمك 👍)" : "  (تم تسجيل ملاحظتك 👎)"),
              }
            : m
        )
      );
    } catch (e) {
      console.error(e);
    }
  }, []);

  const rendered = useMemo(
    () => (
      <>
        {messages.map((msg) => {
          const actions =
            typeof msg.rateIdx === "number" && msg.from === "bot" ? (
              <>
                <IconButton
                  size="small"
                  onClick={() => handleRate(msg.rateIdx!, 1)}
                  title="مفيد"
                  aria-label="تقييم مفيد"
                >
                  <ThumbUpIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleRate(msg.rateIdx!, 0)}
                  title="غير مفيد"
                  aria-label="تقييم غير مفيد"
                >
                  <ThumbDownIcon fontSize="small" />
                </IconButton>
              </>
            ) : undefined;

          return <ChatBubble key={msg.id} msg={msg} actions={actions} />;
        })}

        {/* ✅ “كليم يكتب الآن …” */}
        {botTyping && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                width: 32,
                height: 32,
                mx: 1,
              }}
            >
              <SmartToyIcon />
            </Avatar>
            <Box
              sx={{
                px: 1.5,
                py: 1,
                borderRadius: 2,
                bgcolor: "#f3f3f3",
                color: "text.secondary",
              }}
            >
              كليم يكتب الآن…
            </Box>
          </Box>
        )}

        {loading && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                width: 32,
                height: 32,
                mx: 1,
              }}
            >
              <SmartToyIcon />
            </Avatar>
            <CircularProgress size={20} sx={{ color: KLEEM_COLORS.primary }} />
          </Box>
        )}
      </>
    ),
    [
      messages,
      loading,
      botTyping,
      handleRate,
      theme.palette.primary.main,
      theme.palette.primary.contrastText,
    ]
  );

  return (
    <>
      {showJump && (
        <Box
          sx={{
            position: "sticky",
            bottom: 12,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              const el = messagesContainerRef.current;
              if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
            }}
          >
            أحدث الرسائل
          </Button>
        </Box>
      )}
      {rendered}
      <ChatInput onSend={handleSend} disabled={loading} autoFocusOnMount />
    </>
  );
}
