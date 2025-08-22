// src/pages/Dashboard/ChannelsIntegration.tsx
import { Box, Typography, Stack, Skeleton } from "@mui/material";
import {
  WhatsApp,
  Telegram,
  Chat,
  Instagram,
  Facebook,
  QrCode2,
} from "@mui/icons-material";
import { useState, type JSX } from "react";

import ChannelCard from "@/features/mechant/channels/ui/ChannelCard";
import WhatsappQrConnect from "@/features/mechant/channels/ui/WhatsappQrConnect";
import WhatsappApiConnectDialog from "@/features/mechant/channels/ui/WhatsappApiConnectDialog";
import TelegramConnectDialog from "@/features/mechant/channels/ui/TelegramConnectDialog";
import WebchatConnectDialog from "@/features/mechant/channels/ui/WebchatConnectDialog";

import { useAuth } from "@/context/AuthContext";
import { CHANNELS, type ChannelKey } from "@/features/mechant/channels/constants";
import {
  useChannels,
  useUpdateChannel,
  useDeleteChannel,
} from "@/features/mechant/channels/model";
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
  const { mutateAsync: updateChannel } = useUpdateChannel(merchantId);
  const { mutateAsync: removeChannel } = useDeleteChannel(merchantId);

  const [selectedChannel, setSelectedChannel] = useState<ChannelKey | null>(
    null
  );
  const [openWhatsappQr, setOpenWhatsappQr] = useState(false);
  const [openWhatsappApi, setOpenWhatsappApi] = useState(false);
  const [openTelegram, setOpenTelegram] = useState(false);
  const [openWebchat, setOpenWebchat] = useState(false);

  const detailData = selectedChannel
    ? (channels?.[selectedChannel] as any)
    : undefined;

  const openConnector = (key: ChannelKey) => {
    if (key === "whatsappQr") return setOpenWhatsappQr(true);
    if (key === "whatsappApi") return setOpenWhatsappApi(true);
    if (key === "telegram") return setOpenTelegram(true);
    if (key === "webchat") return setOpenWebchat(true);
  };

  const handleToggle = async (key: ChannelKey, enabled: boolean) => {
    // تفعيل القنوات التي تحتاج Wizard/DIalog
    if (
      enabled &&
      (key === "whatsappQr" ||
        key === "whatsappApi" ||
        key === "telegram" ||
        key === "webchat")
    ) {
      openConnector(key);
      return;
    }
    // تعطيل سريع
    if (!enabled) {
      await removeChannel({ key, mode: "disable" });
      return;
    }
    // قنوات لا تحتاج حوار (لو أضفت لاحقاً)
    await updateChannel({ key, partial: { enabled } });
  };

  const handleDialogSuccess = async (key: ChannelKey) => {
    await updateChannel({ key, partial: { enabled: true } });
  };

  const comingSoon = (key: ChannelKey) =>
    key === "instagram" || key === "messenger";

  const dangerNote = (key: ChannelKey) =>
    key === "whatsappApi"
      ? "تنبيه: خيار المسح الكامل سيحذف جميع أسرار واتساب الرسمي من قاعدة البيانات."
      : key === "whatsappQr"
      ? "تنبيه: خيار الفصل سيحذف الجلسة من Evolution، وقد تحتاج لإعادة مسح QR."
      : undefined;

  return (
    <Box
      sx={{ p: { xs: 2, md: 4 }, width: "100%", maxWidth: 1100, mx: "auto" }}
      dir="rtl"
    >
      <Typography variant="h5" fontWeight={800} mb={4} textAlign="right">
        إعدادات القنوات وتكاملها
      </Typography>

      <Stack
        direction="row"
        flexWrap="wrap"
        gap={{ xs: 2, md: 4 }}
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
                  sx={{
                    flex: "1 1 250px",
                    minWidth: 250,
                    maxWidth: 320,
                    minHeight: 0,
                  }}
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
                    disabled={comingSoon(ch.key)}
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

      {/* واتساب رسمي (Cloud API) */}
      <WhatsappApiConnectDialog
        open={openWhatsappApi}
        onClose={(success) => {
          setOpenWhatsappApi(false);
          if (success) handleDialogSuccess("whatsappApi");
        }}
        merchantId={merchantId}
        initial={{
          accessToken: channels?.whatsappApi?.accessToken as string | undefined,
          appSecret: channels?.whatsappApi?.appSecret as string | undefined,
          verifyToken: channels?.whatsappApi?.verifyToken as string | undefined,
          phoneNumberId: channels?.whatsappApi?.phoneNumberId as
            | string
            | undefined,
          wabaId: channels?.whatsappApi?.wabaId as string | undefined,
          enabled: !!channels?.whatsappApi?.enabled,
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

      {/* تفاصيل القناة + إجراءات */}
      <ChannelDetailsDialog
        open={!!selectedChannel}
        onClose={() => setSelectedChannel(null)}
        title={CHANNELS.find((c) => c.key === selectedChannel)?.title ?? ""}
        data={detailData as any}
        dangerNote={selectedChannel ? dangerNote(selectedChannel) : undefined}
        onDisable={
          selectedChannel
            ? async () => {
                await removeChannel({ key: selectedChannel, mode: "disable" });
                setSelectedChannel(null);
              }
            : undefined
        }
        onDisconnect={
          selectedChannel
            ? async () => {
                await removeChannel({
                  key: selectedChannel,
                  mode: "disconnect",
                });
                setSelectedChannel(null);
              }
            : undefined
        }
        onWipe={
          selectedChannel
            ? async () => {
                await removeChannel({ key: selectedChannel, mode: "wipe" });
                setSelectedChannel(null);
              }
            : undefined
        }
      />
    </Box>
  );
}
