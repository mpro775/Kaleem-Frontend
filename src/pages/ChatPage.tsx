// src/pages/ChatPage.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import WidgetChatUI from "../components/chat_Setting/WidgetChatUI";

export default function ChatPage() {
  const { widgetSlug } = useParams();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // استدعي الإعدادات بناءً على الـ slug وليس merchantId
    axios
      .get(`/public/chat-widget/${widgetSlug}`)
      .then((res) => {
        setSettings(res.data);
      })
      .finally(() => setLoading(false));
  }, [widgetSlug]);

  if (loading) return <div>...تحميل الإعدادات</div>;
  if (!settings) return <div>لم يتم العثور على الدردشة</div>;

  return (
    <WidgetChatUI settings={settings} />
  );
}
