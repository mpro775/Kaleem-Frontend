// components/channel/WhatsappQrConnect.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import axios from "../../api/axios";
interface WhatsappChannelInfo {
  status: string;
  owner?: string;
  profileName?: string;
  profilePictureUrl?: string | null;
  sessionId?: string;
  webhookUrl?: string;
}

interface WhatsappQrConnectProps {
  open: boolean;
  onClose: () => void;
  merchantId: string;
  onSuccess: () => void;
}

export default function WhatsappQrConnect({
  open,
  onClose,
  merchantId,
  onSuccess,
}: WhatsappQrConnectProps) {  const [qr, setQr] = useState<string>("");
  const [sessionStatus, setSessionStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [channelInfo, setChannelInfo] = useState<WhatsappChannelInfo | null>(null);

  const handleStartSession = async () => {
    setLoading(true);
    setQr("");
    setSessionStatus("");
    setStarted(true);

    try {
      const res = await axios.post(`/merchants/${merchantId}/whatsapp/start-session`, {});
      const data = res.data;
      if (data.qr) {
        setQr(data.qr.startsWith("data:image/") ? data.qr : `data:image/png;base64,${data.qr}`);
      } else {
        setQr("");
      }
    } catch {
      setStarted(false);
      alert("حدث خطأ أثناء الربط");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!merchantId || !started) return;
    let interval: NodeJS.Timeout | null = null;
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`/merchants/${merchantId}/whatsapp/status`);
        const data = res.data;
        setSessionStatus(data.status);
        setChannelInfo(data);
        if (
          data.status === "open" ||
          data.status === "CONNECTED" ||
          data.status === "authenticated"
        ) {
          onSuccess();
        }
      } catch {
        setSessionStatus("");
        setChannelInfo(null);
      }
    };
    fetchStatus();
    interval = setInterval(fetchStatus, 5000);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [merchantId, started, onSuccess]);

  const isConnected =
    sessionStatus === "open" ||
    sessionStatus === "CONNECTED" ||
    sessionStatus === "authenticated";

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>ربط واتساب - QR</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} alignItems="center">
          <Button
            variant="contained"
            color="success"
            onClick={handleStartSession}
            disabled={loading || isConnected}
            sx={{ minWidth: 150 }}
          >
            {loading ? (
              <CircularProgress size={22} />
            ) : isConnected ? (
              "مرتبط ✅"
            ) : (
              "ربط واتساب"
            )}
          </Button>

          {qr && !isConnected && (
            <Box mt={2} textAlign="center">
              <Typography variant="body2" color="text.secondary" mb={1}>
                امسح الكود التالي عبر تطبيق واتساب
              </Typography>
              <img
                src={qr}
                alt="QR"
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 12,
                  border: "1px solid #eee",
                }}
              />
            </Box>
          )}

          {sessionStatus && (
            <Box mt={2} textAlign="center">
              {isConnected ? (
                <Box>
                  <Typography color="success.main" fontWeight="bold">
                    ✅ تم الربط بنجاح!
                  </Typography>
                  {channelInfo && (
                    <Box mt={2}>
                      <Typography>الرقم: {channelInfo.owner}</Typography>
                      <Typography>الاسم: {channelInfo.profileName}</Typography>
                      {channelInfo.profilePictureUrl && (
                        <img
                          src={channelInfo.profilePictureUrl}
                          alt="حساب واتساب"
                          style={{ width: 70, borderRadius: 35, marginTop: 8 }}
                        />
                      )}
                      <Typography variant="caption" color="gray">
                        Session ID: {channelInfo.sessionId}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : sessionStatus === "pending" || sessionStatus === "QRCODE" ? (
                <Typography color="warning.main">
                  في انتظار ربط الجهاز ومسح الباركود...
                </Typography>
              ) : (
                <Box>
                  <Typography color="error.main">
                    الحالة: {sessionStatus}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleStartSession}
                    disabled={loading}
                    sx={{ mt: 2 }}
                  >
                    {loading ? <CircularProgress size={22} /> : "إعادة الربط"}
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {started && !isConnected && (
            <Typography variant="caption" color="warning.main" sx={{ mt: 1 }}>
              إذا لم يظهر QR أو لم يتم الربط خلال دقيقة، أعد المحاولة أو تأكد من اتصال الخادم.
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
