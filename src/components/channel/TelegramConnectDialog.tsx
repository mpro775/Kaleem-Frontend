// components/channel/TelegramConnectDialog.tsx
import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import axios from "../../api/axios";
interface TelegramConnectDialogProps {
  open: boolean;
  onClose: (success: boolean) => void;
  merchantId: string;
  initialEnabled?: boolean;
  initialToken?: string;
}
export default function TelegramConnectDialog({
  open,
  onClose,
  merchantId,
  initialEnabled = false,
  initialToken = "",
}: TelegramConnectDialogProps) {  const [token, setToken] = useState(initialToken || "");
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(initialEnabled || false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!token) {
      setError("الرجاء إدخال توكن البوت");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await axios.patch(`/merchants/${merchantId}/channels/telegram`, {
        enabled: true,
        token,
      });
      setConnected(true);
      onClose(true); // أعلم الصفحة الأم أنه تم الربط بنجاح
    } catch {
      setError("فشل الربط، تأكد من صحة التوكن والمحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)}>
      <DialogTitle>ربط تيليجرام</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Typography variant="body2" mb={1}>
            يرجى إدخال توكن بوت تيليجرام الخاص بك:
          </Typography>
          <TextField
            fullWidth
            placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
            value={token}
            onChange={e => setToken(e.target.value)}
            disabled={loading || connected}
          />
        </Box>
        {error && <Typography color="error.main">{error}</Typography>}
        {connected && (
          <Typography color="success.main" fontWeight="bold">
            ✅ تم الربط بنجاح!
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} disabled={loading}>
          إلغاء
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading || connected}
          variant="contained"
          color="success"
        >
          {loading ? <CircularProgress size={22} /> : "حفظ وربط"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
