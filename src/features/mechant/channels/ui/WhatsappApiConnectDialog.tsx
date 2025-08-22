// src/widgets/merchant/channels/WhatsappApiConnectDialog.tsx
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
  Grid,
} from "@mui/material";
import axios from "@/shared/api/axios";

type Props = {
  open: boolean;
  onClose: (success: boolean) => void;
  merchantId: string;
  initial?: {
    accessToken?: string;
    appSecret?: string;
    verifyToken?: string;
    phoneNumberId?: string;
    wabaId?: string;
    enabled?: boolean;
  };
};

export default function WhatsappApiConnectDialog({
  open,
  onClose,
  merchantId,
  initial,
}: Props) {
  const [form, setForm] = useState({
    accessToken: initial?.accessToken ?? "",
    appSecret: initial?.appSecret ?? "",
    verifyToken: initial?.verifyToken ?? "",
    phoneNumberId: initial?.phoneNumberId ?? "",
    wabaId: initial?.wabaId ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<boolean>(!!initial?.enabled);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (k: string, v: string) =>
    setForm((s) => ({ ...s, [k]: v }));

  const handleSave = async () => {
    if (
      !form.accessToken ||
      !form.appSecret ||
      !form.verifyToken ||
      !form.phoneNumberId
    ) {
      setError(
        "الحقول الأساسية مطلوبة: Access Token و App Secret و Verify Token و Phone Number ID"
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await axios.patch(`/merchants/${merchantId}/channels/whatsappApi`, {
        ...form,
        enabled: true,
      });
      setOk(true);
      onClose(true);
    } catch {
      setError("تعذر حفظ الإعدادات. تأكد من القيم.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} fullWidth maxWidth="sm">
      <DialogTitle dir="rtl">ربط واتساب الرسمي (Cloud API)</DialogTitle>
      <DialogContent dir="rtl" sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary" mb={2}>
          أدخل بيانات واتساب السحابي من منصة Meta (WABA):
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{xs:12}}>
            <TextField
              label="Access Token"
              fullWidth
              type="password"
              value={form.accessToken}
              onChange={(e) => handleChange("accessToken", e.target.value)}
            />
          </Grid>
          <Grid size={{xs:12,sm:6}}>
            <TextField
              label="App Secret"
              fullWidth
              type="password"
              value={form.appSecret}
              onChange={(e) => handleChange("appSecret", e.target.value)}
            />
          </Grid>
          <Grid size={{xs:12,sm:6}}>
            <TextField
              label="Verify Token"
              fullWidth
              value={form.verifyToken}
              onChange={(e) => handleChange("verifyToken", e.target.value)}
            />
          </Grid>
          <Grid size={{xs:12,sm:6}}>
            <TextField
              label="Phone Number ID"
              fullWidth
              value={form.phoneNumberId}
              onChange={(e) => handleChange("phoneNumberId", e.target.value)}
            />
          </Grid>
          <Grid size={{xs:12,sm:6}} >
            <TextField
              label="WABA ID (اختياري)"
              fullWidth
              value={form.wabaId}
              onChange={(e) => handleChange("wabaId", e.target.value)}
            />
          </Grid>
        </Grid>

        {error && (
          <Box mt={2}>
            <Typography sx={{ color: "error.main" }}>{error}</Typography>
          </Box>
        )}
        {ok && (
          <Box mt={2}>
            <Typography sx={{ color: "success.main" }}>
              ✅ تم الحفظ والتفعيل!
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} disabled={loading}>
          إلغاء
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleSave}
          disabled={loading || ok}
        >
          {loading ? <CircularProgress size={22} /> : "حفظ وتفعيل"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
