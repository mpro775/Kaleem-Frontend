import { useEffect, useState, useRef } from "react";
import { fetchSessionMessages, sendMessage } from "@/api/messages"; // أو المسار الصحيح لديك
import type { ChatMessage } from "@/types/chat";
import { useChatWebSocket } from "@/hooks/useChatWebSocket";

type WidgetSettings = {
  merchantId: string;
  botName: string;
  welcomeMessage: string;
  brandColor: string;
  fontFamily: string;
  headerBgColor: string;
  bodyBgColor: string;
};

export default function WidgetChatUI({
  settings,
}: {
  settings: WidgetSettings;
}) {
  // ربط sessionId لكل عميل
  const [sessionId] = useState(
    () =>
      localStorage.getItem(`kaleem_session_${settings.merchantId}`) ||
      (() => {
        const uuid =
          crypto?.randomUUID?.() ??
          Date.now().toString(36) + Math.random().toString(36).slice(2);
        localStorage.setItem(`kaleem_session_${settings.merchantId}`, uuid);
        return uuid;
      })()
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  useChatWebSocket(sessionId, (msg) => {
    setMessages((prev) => [...prev, msg]);
  });
  // تحميل الرسائل عند فتح الصفحة أو عند تغير sessionId
  useEffect(() => {
    setLoading(true);
    fetchSessionMessages(sessionId)
      .then((msgs) => setMessages(msgs ?? []))
      .finally(() => setLoading(false));
  }, [sessionId]);

  // Scroll دائماً لآخر رسالة
  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // إرسال رسالة
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setInput(""); // أفرغ الحقل فورًا
    await sendMessage({
      merchantId: settings.merchantId,
      sessionId,
      channel: "webchat",
      messages: [{ role: "customer", text: input.trim() }],
    });
    // لا تضف setMessages هنا!
  };

  if (!settings) return <div>...تحميل الإعدادات</div>;
  console.log("sessionId", sessionId);
  console.log("settings", settings);
  console.log("messages", messages);

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "40px auto",
        borderRadius: 16,
        boxShadow: "0 6px 40px #0002",
        overflow: "hidden",
        fontFamily: settings.fontFamily,
        background: settings.bodyBgColor,
        border: `2px solid ${settings.brandColor}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: settings.headerBgColor,
          color: "#fff",
          padding: 18,
          fontWeight: 700,
        }}
      >
        {settings.botName || "MusaidBot"}
      </div>

      {/* رسائل الدردشة */}
      <div
        style={{
          minHeight: 220,
          maxHeight: 350,
          overflowY: "auto",
          background: "#fff",
          padding: 10,
        }}
      >
        {Array.isArray(messages) && messages.length === 0 && (
          <div style={{ color: "#aaa", textAlign: "center", margin: 20 }}>
            {settings.welcomeMessage}
          </div>
        )}
        {Array.isArray(messages) &&
          messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                textAlign: msg.role === "customer" ? "right" : "left",
                margin: 6,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  background:
                    msg.role === "customer" ? "#f0f0f0" : settings.brandColor,
                  color: msg.role === "customer" ? "#222" : "#fff",
                  padding: 8,
                  borderRadius: 12,
                  maxWidth: 270,
                  wordBreak: "break-word",
                }}
              >
                {msg.text}
              </span>
            </div>
          ))}
        <div ref={bottomRef} />
      </div>

      {/* حقل كتابة الرسالة */}
      <form
        onSubmit={handleSend}
        style={{
          borderTop: `1px solid ${settings.brandColor}22`,
          background: "#f6f6f6",
          display: "flex",
          alignItems: "center",
          padding: 8,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            padding: 10,
            borderRadius: 8,
            marginRight: 8,
            fontFamily: settings.fontFamily,
            fontSize: 15,
            background: "#fff",
          }}
          placeholder="اكتب رسالتك هنا…"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            background: settings.brandColor,
            color: "#fff",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          إرسال
        </button>
      </form>
    </div>
  );
}
