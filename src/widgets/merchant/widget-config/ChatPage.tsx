// src/pages/Dashboard/ChatPage.tsx
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_BASE } from "../../context/config";

export default function ChatPage() {
  // 1) استخرج slug من المسار
  const { slug } = useParams<{ slug: string }>();
  // 2) رابط الـ API عبر البروكسي (Vite proxy)

  // 3) استخدم useEffect دائماً في نفس الترتيب
  useEffect(() => {
    // إذا لم يكن لدينا slug فلا نفعل شيئاً
    if (!slug) return;

    // حقن إعدادات الـ widget
    const settingsScript = document.createElement("script");
    settingsScript.type = "text/javascript";
    settingsScript.innerHTML = `
      window.MusaidChat = {
        merchantId: "${slug}",
        apiBaseUrl: "${API_BASE}",
        mode: "bubble"
      };
    `;
    document.head.appendChild(settingsScript);

    // تحميل widget.js من مجلد public في الـ frontend
    const widgetScript = document.createElement("script");
    widgetScript.src = "/widget.js";
    widgetScript.async = true;
    document.body.appendChild(widgetScript);

    // نظّف عند إزالة المكوّن
    return () => {
      document.head.removeChild(settingsScript);
      document.body.removeChild(widgetScript);
      delete window.MusaidChat;
    };
  }, [slug]);

  // دائماً نُنفّذ useEffect قبل أي return شرطية
  return null;
}
