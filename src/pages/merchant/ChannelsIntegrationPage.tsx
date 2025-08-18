// pages/ChannelsIntegration.tsx
import {
  Box,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import {
  WhatsApp,
  Telegram,
  Chat,
  Instagram,
  Facebook,
  QrCode2,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import ChannelCard from "../../components/channel/ChannelCard";
import WhatsappQrConnect from "../../components/channel/WhatsappQrConnect";
import TelegramConnectDialog from "../../components/channel/TelegramConnectDialog";
import WebchatConnectDialog from "../../components/channel/WebchatConnectDialog";
import axiosInstance from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
interface ChannelData {
  enabled?: boolean;
  token?: string;
  sessionId?: string;
  status?: string;
  webhookUrl?: string;
  qr?: string;
  [key: string]: unknown; // لتقبل أي بيانات إضافية بدون any
}
type ChannelsMap = Record<string, ChannelData>;

const CHANNELS = [
  { key: "telegram", icon: <Telegram fontSize="large" />, title: "تيليجرام" },
  { key: "whatsapp", icon: <QrCode2 fontSize="large" />, title: "واتساب QR" }, // هذا الحالي
  { key: "webchat", icon: <Chat fontSize="large" />, title: "كليم" },
  {
    key: "whatsappApi",
    icon: <WhatsApp fontSize="large" />,
    title: "واتساب رسمي",
  },
  { key: "instagram", icon: <Instagram fontSize="large" />, title: "إنستجرام" },
  { key: "messenger", icon: <Facebook fontSize="large" />, title: "ماسنجر" },
];

export default function ChannelsIntegrationPage() {
  const { user } = useAuth();
  const merchantId = user?.merchantId ?? "";
  const [channels, setChannels] = useState<ChannelsMap>({});

  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const [openWhatsappQr, setOpenWhatsappQr] = useState(false);
  const [openTelegram, setOpenTelegram] = useState(false);
  const [openWebchat, setOpenWebchat] = useState(false);
  // جلب بيانات القنوات عند تحميل الصفحة
  useEffect(() => {
    axiosInstance
      .get(`/merchants/${merchantId}`)
      .then((res) => {
        // channels في الرد الرئيسي (حسب الـ schema)
        setChannels(res.data.channels);
      })
      .catch(() => {
        // التعامل مع الخطأ إذا فشل
        alert(`فتح طريقة الربط لـ: `);
      });
  }, [merchantId]);
  const handleToggle = (key: string, enabled: boolean) => {
    if (key === "whatsappQr" && enabled) return setOpenWhatsappQr(true);
    if (key === "telegram" && enabled) return setOpenTelegram(true);
    if (key === "webchat" && enabled) return setOpenWebchat(true);
    setChannels((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), enabled: true },
    })); // send PATCH to backend here if needed
  };

  const handleGuide = (key: string) => {
    alert(`فتح طريقة الربط لـ: ${key}`);
  };

  const handleDialogSuccess = (key: string) => {
    setChannels((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), enabled: true },
    }));
  };

  return (
    <Box
      sx={{ p: { xs: 2, md: 4 }, width: "100%", maxWidth: 1100, mx: "auto" }}
    >
      <Typography variant="h5" fontWeight={800} mb={4} textAlign="right">
        إعدادات القنوات وتكاملها
      </Typography>
      <Stack
        direction="row"
        flexWrap="wrap"
        gap={4}
        justifyContent={{ xs: "center", md: "flex-start" }}
      >
        {CHANNELS.map((ch) => (
          <Box
            key={ch.key}
            sx={{ flex: "1 1 250px", minWidth: 250, maxWidth: 320 }}
          >
            <ChannelCard
              icon={ch.icon}
              title={ch.title}
      enabled={!!channels[ch.key]?.enabled} // ✅ هذا الصحيح
              onToggle={(checked) => handleToggle(ch.key, checked)}
              onGuide={() => handleGuide(ch.key)}
              statusColor={
                ch.key === "messenger" && channels[ch.key]
                  ? "#5856D6"
                  : undefined
              }
              onCardClick={() => setSelectedChannel(ch.key)}
            />
          </Box>
        ))}
      </Stack>

      {/* حوار واتساب QR */}
      <WhatsappQrConnect
        open={openWhatsappQr}
        onClose={() => setOpenWhatsappQr(false)}
        merchantId={merchantId}
        onSuccess={() => {
          handleDialogSuccess("whatsappQr");
          setOpenWhatsappQr(false);
        }}
      />

      {/* حوار تيليجرام */}
      <TelegramConnectDialog
        open={openTelegram}
        onClose={(success) => {
          setOpenTelegram(false);
          if (success) handleDialogSuccess("telegram");
        }}
        merchantId={merchantId}
      />

      {/* حوار ويب شات */}
      <WebchatConnectDialog
        open={openWebchat}
        onClose={(success) => {
          setOpenWebchat(false);
          if (success) handleDialogSuccess("webchat");
        }}
        merchantId={merchantId}
      />
      <Dialog
        open={!!selectedChannel}
        onClose={() => setSelectedChannel(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          تفاصيل ربط قناة{" "}
          {CHANNELS.find((c) => c.key === selectedChannel)?.title}
        </DialogTitle>
        <DialogContent>
          {selectedChannel && channels && channels[selectedChannel] ? (
            <Box>
              {Object.entries(channels[selectedChannel]).map(([key, value]) => (
                <Box key={key} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {key}:
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                    {String(value)}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography>لا توجد بيانات لهذه القناة.</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
