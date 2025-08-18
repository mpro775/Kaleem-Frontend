// src/pages/Dashboard/ChannelsIntegration.tsx
import {
  Box,
  Typography,
  Stack,

  Skeleton,
} from "@mui/material";
import {
  WhatsApp,
  Telegram,
  Chat,
  Instagram,
  Facebook,
  QrCode2,
} from "@mui/icons-material";
import {  useState, type JSX } from "react";
import ChannelCard from "@/widgets/merchant/channels/ChannelCard";
import WhatsappQrConnect from "@/widgets/merchant/channels/WhatsappQrConnect";
import TelegramConnectDialog from "@/widgets/merchant/channels/TelegramConnectDialog";
import WebchatConnectDialog from "@/widgets/merchant/channels/WebchatConnectDialog";
import { useAuth } from "@/context/AuthContext";
import { CHANNELS, type ChannelKey } from "@/features/mechant/channels/constants";
import { useChannels, useUpdateChannel } from "@/features/mechant/channels/model";
import ChannelDetailsDialog from "@/features/mechant/channels/ui/ChannelDetailsDialog";

const ICONS: Record<ChannelKey, JSX.Element> = {
  telegram: <Telegram fontSize="large" />,
  whatsappQr: <QrCode2 fontSize="large" />,
  webchat: <Chat fontSize="large" />,
  whatsappApi: <WhatsApp fontSize="large" />,
  instagram: <Instagram fontSize="large" />,
  messenger: <Facebook fontSize="large" />,
};

export default function ChannelsIntegrationPage() {
  const { user } = useAuth();
  const merchantId = user?.merchantId ?? "";

  const { data: channels, isLoading } = useChannels(merchantId);
  const { mutateAsync: updateChannel, isPending } =
    useUpdateChannel(merchantId);

  const [selectedChannel, setSelectedChannel] = useState<ChannelKey | null>(
    null
  );
  const [openWhatsappQr, setOpenWhatsappQr] = useState(false);
  const [openTelegram, setOpenTelegram] = useState(false);
  const [openWebchat, setOpenWebchat] = useState(false);
  const detailData = selectedChannel ? channels?.[selectedChannel] : undefined;

  // فتح ديالوج الربط المناسب
  const openConnector = (key: ChannelKey) => {
    if (key === "whatsappQr") return setOpenWhatsappQr(true);
    if (key === "telegram") return setOpenTelegram(true);
    if (key === "webchat") return setOpenWebchat(true);
  };

  const handleToggle = async (key: ChannelKey, enabled: boolean) => {
    // القنوات اللي تحتاج ديالوج: افتح الديالوج ولا تفعّل حتى ينجح الربط
    if (
      enabled &&
      (key === "whatsappQr" || key === "telegram" || key === "webchat")
    ) {
      openConnector(key);
      return;
    }
    // قنوات بدون ديالوج: حدّث الـ backend مباشرة
    await updateChannel({ key, partial: { enabled } });
  };

  const handleDialogSuccess = async (key: ChannelKey) => {
    // بعد نجاح الربط: علّم القناة enabled=true في الباك
    await updateChannel({ key, partial: { enabled: true } });
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
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Box
                key={i}
                sx={{ flex: "1 1 250px", minWidth: 250, maxWidth: 320 }}
              >
                <Skeleton variant="rounded" height={160} />
              </Box>
            ))
          : CHANNELS.map((ch) => {
              const enabled = !!channels?.[ch.key]?.enabled;
              return (
                <Box
                  key={ch.key}
                  sx={{ flex: "1 1 250px", minWidth: 250, maxWidth: 320 }}
                >
                  <ChannelCard
                    icon={ICONS[ch.key]}
                    title={ch.title}
                    enabled={enabled}
                    onToggle={(checked) => handleToggle(ch.key, checked)}
                    onGuide={() => setSelectedChannel(ch.key)}
                    statusColor={
                      ch.key === "messenger" && channels?.[ch.key]
                        ? "#5856D6"
                        : undefined
                    }
                    onCardClick={() => setSelectedChannel(ch.key)}
                    // disabled={isPending}
                  />
                </Box>
              );
            })}
      </Stack>

      {/* واتساب QR */}
      <WhatsappQrConnect
        open={openWhatsappQr}
        onClose={() => setOpenWhatsappQr(false)}
        merchantId={merchantId}
        onSuccess={() => {
          setOpenWhatsappQr(false);
          handleDialogSuccess("whatsappQr");
        }}
      />
      {/* تيليجرام */}
      <TelegramConnectDialog
        open={openTelegram}
        onClose={(success) => {
          setOpenTelegram(false);
          if (success) handleDialogSuccess("telegram");
        }}
        merchantId={merchantId}
      />
      {/* ويب شات */}
      <WebchatConnectDialog
        open={openWebchat}
        onClose={(success) => {
          setOpenWebchat(false);
          if (success) handleDialogSuccess("webchat");
        }}
        merchantId={merchantId}
      />

      {/* تفاصيل القناة */}
      <ChannelDetailsDialog
        open={!!selectedChannel}
        onClose={() => setSelectedChannel(null)}
        title={CHANNELS.find((c) => c.key === selectedChannel)?.title ?? ""}
        data={detailData as any}
      />
    </Box>
  );
}
