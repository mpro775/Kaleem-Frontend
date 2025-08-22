import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import axios from "@/shared/api/axios";

interface WebchatConnectDialogProps {
  open: boolean;
  onClose: (success: boolean) => void;
  merchantId: string;
  initialEnabled?: boolean;
}

export default function WebchatConnectDialog({
  open,
  onClose,
  merchantId,
  initialEnabled = false,
}: WebchatConnectDialogProps) {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(initialEnabled || false);
  const [error, setError] = useState<string | null>(null);

  const handleEnable = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.patch(`/merchants/${merchantId}/channels/webchat`, {
        enabled: true,
        widgetSettings: {},
      });
      setConnected(true);
      onClose(true);
    } catch {
      setError("فشل الربط");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} fullWidth maxWidth="xs">
      <DialogTitle dir="rtl">تفعيل كليم (Web Chat)</DialogTitle>
      <DialogContent dir="rtl">
        <Typography>لتفعيل الكليم، اضغط على زر التفعيل وسيتم توليد كود الويدجت للمتجر.</Typography>
        {error && (
          <Box mt={2}>
            <Typography sx={{ color: "error.main" }}>{error}</Typography>
          </Box>
        )}
        {connected && (
          <Box mt={2}>
            <Typography sx={{ color: "success.main" }}>✅ تم التفعيل بنجاح!</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} disabled={loading}>
          إغلاق
        </Button>
        <Button onClick={handleEnable} variant="contained" color="primary" disabled={loading || connected}>
          {loading ? <CircularProgress size={22} /> : "تفعيل"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
