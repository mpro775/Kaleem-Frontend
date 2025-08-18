// components/channel/WebchatConnectDialog.tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from "@mui/material";
import { useState } from "react";
import axios from "../../api/axios";

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
}: WebchatConnectDialogProps) {  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(initialEnabled || false);

  const handleEnable = async () => {
    setLoading(true);
    try {
      await axios.patch(`/merchants/${merchantId}/channels/webchat`, {
        enabled: true,
        widgetSettings: {},
      });
      setConnected(true);
      onClose(true);
    } catch {
      alert("فشل الربط");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)}>
      <DialogTitle>تفعيل كليم (Web Chat)</DialogTitle>
      <DialogContent>
        <Typography>لتفعيل الكليم، اضغط على زر التفعيل وسيتم توليد كود الويدجت للمتجر.</Typography>
        {connected && (
          <Box mt={2}>
            <Typography color="success.main">✅ تم التفعيل بنجاح!</Typography>
            {/* يمكن عرض كود الويدجت هنا لاحقاً */}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} disabled={loading}>
          إغلاق
        </Button>
        <Button onClick={handleEnable} variant="contained" color="primary" disabled={loading || connected}>
          تفعيل
        </Button>
      </DialogActions>
    </Dialog>
  );
}
