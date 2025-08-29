// src/pages/ChatPage.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "@/shared/api/axios";
import WidgetChatUI from "@/features/mechant/widget-config/ui/WidgetChatUI";
import { Box, Paper, Skeleton, Alert, Stack } from "@mui/material";
import { useErrorHandler } from "@/shared/errors";

type Raw = any;

function unwrap(x: Raw) {
  // يدعم أشكال: res.data.data أو res.data أو الكائن مباشرة
  return x?.data?.data ?? x?.data ?? x;
}

// طبع الإعدادات إلى الواجهة المتوقعة من WidgetChatUI
function normalizeSettings(raw: Raw) {
  const d = unwrap(raw);

  // مصادر محتملة للمعرّف والسلاج والموضوعات
  const merchantId = d?.merchant?.id || d?.merchant?._id || d?.merchantId;
  const publicSlug = d?.merchant?.slug || d?.publicSlug || d?.slug;
  const widgetSlug = d?.widgetSlug || publicSlug;

  return {
    merchantId,
    botName: d?.botName || d?.merchant?.name || "Kaleem Bot",
    welcomeMessage: d?.welcomeMessage ?? "أهلًا! كيف أقدر أساعدك؟",
    brandColor: d?.theme?.primaryColor || d?.brandColor || "#111827",
    fontFamily: d?.fontFamily || "Tajawal, system-ui, sans-serif",
    avatarUrl: d?.avatarUrl,
    showPoweredBy: d?.showPoweredBy !== false,
    publicSlug,
    widgetSlug,
    embedMode: d?.embedMode || "bubble",
  };
}

export default function ChatPage() {
  const { handleError } = useErrorHandler();

  // ✅ التقط أي اسم بارام محتمل لتفادي undefined
  const params = useParams();
  const slug =
    (params.widgetSlug as string) ||
    (params.slug as string) ||
    (params.slugOrId as string) ||
    (params.id as string) ||
    "";

  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (!slug) throw new Error("لا يوجد سلاج في المسار.");

        // ملاحظة: الاندبوينت عندك هو /public/chat-widget/:slug
        const res = await axios.get(`/public/chat-widget/${slug}`);
        const normalized = normalizeSettings(res);

        if (!normalized.merchantId) {
          throw new Error("تعذر تحديد معرف التاجر لإعدادات الدردشة.");
        }

        if (mounted) setSettings(normalized);
      } catch (e: any) {
        if (!mounted) return;
        setError(
          e?.response?.data?.message || e?.message || "حدث خطأ غير متوقع"
        );
        handleError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [slug, handleError]);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        p: { xs: 1.5, md: 3 },
        background: "linear-gradient(180deg,#f6f7fb,#eef1f7)",
        display: "flex",
        alignItems: "stretch",
      }}
    >
      {/* وعاء مرن بعرض محترم على الديسكتوب، وعرض كامل على الجوال */}
      <Box
        sx={{
          mx: "auto",
          width: "100%",
          maxWidth: { xs: "100%", sm: 720, md: 980 },
          height: { xs: "calc(100dvh - 24px)", md: "calc(100dvh - 48px)" },
          display: "flex",
        }}
      >
        {loading && (
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, flex: 1 }}>
            <Stack spacing={1.5}>
              <Skeleton variant="rounded" height={60} />
              <Skeleton variant="rounded" height={280} />
              <Skeleton variant="rounded" height={56} />
            </Stack>
          </Paper>
        )}

        {!loading && error && (
          <Alert severity="error" sx={{ direction: "rtl", flex: 1 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && !settings && (
          <Alert severity="warning" sx={{ direction: "rtl", flex: 1 }}>
            لم يتم العثور على إعدادات الدردشة.
          </Alert>
        )}

        {!loading && !error && settings && (
          <WidgetChatUI
            settings={{ ...settings, embedMode: "conversational" }}
            layout="standalone" // 👈 جديد
          />
        )}
      </Box>
    </Box>
  );
}
