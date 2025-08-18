// src/pages/ChatEmbedPage.tsx
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function ChatEmbedPage() {
  const [params] = useSearchParams();
  const merchantId = params.get('merchantId')!;
  const sessionId  = params.get('sessionId')!;

  useEffect(() => {
    if (!merchantId || !sessionId) return;
    // حقن الإعدادات
    const s = document.createElement('script');
    s.innerHTML = `
      window.MusaidBotSettings = {
        merchantId: "${merchantId}",
        apiBaseUrl: "${process.env.REACT_APP_API_BASE_URL}",
        webhooksUrl: "${process.env.REACT_APP_API_BASE_URL}/api/webhooks",
        themeColor: "#D84315",
        greeting: "مرحباً! كيف أستطيع مساعدتك اليوم؟",
        sessionIdOverride: "${sessionId}"
      };
    `;
    document.head.appendChild(s);
    // تحميل widget.js
    const w = document.createElement('script');
    w.src = "/widget.js";
    w.async = false;
    document.body.appendChild(w);
  }, [merchantId, sessionId]);

  return null; // ستظهر الدردشة فقط
}
