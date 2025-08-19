import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Avatar,
  Typography,
  CircularProgress,
  Stack,
  Snackbar,
  Alert,

} from "@mui/material";

import axios from "@/api/axios";
import type { MerchantInfo } from "@/features/mechant/merchant-settings/types";






interface GeneralInfoFormProps {
  initialData: MerchantInfo;
  onSave: (data: Partial<MerchantInfo>) => Promise<void>;
  loading?: boolean;
}

export default function GeneralInfoForm({
  initialData,
  onSave,
  loading,
}: GeneralInfoFormProps) {
  const [form, setForm] = useState<MerchantInfo>({
    ...initialData,
  });

  const [logoUploading, setLogoUploading] = useState(false);

 

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: keyof MerchantInfo, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  // رفع الشعار
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ACCEPT = ["image/png", "image/jpeg", "image/webp"];
    const MAX_SIZE_MB = 2;

    if (!ACCEPT.includes(file.type)) {
      setError("الملف يجب أن يكون PNG أو JPG أو WEBP");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`الحجم الأقصى ${MAX_SIZE_MB}MB`);
      return;
    }

    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file, file.name);

      // ✅ لا تضبط Content-Type هنا
      const { data } = await axios.post<{ url: string }>(
        `/merchants/${initialData._id}/logo`,
        fd
      );

      handleChange("logoUrl", data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "فشل رفع الشعار");
    } finally {
      setLogoUploading(false);
      e.currentTarget.value = "";
    }
  };

  // التحقق الفوري من الـ slug

 
  const handleSave = async () => {
    try {
     

      const payload: Partial<MerchantInfo> = {};
      if (form.name !== initialData.name) payload.name = form.name;
      if ((form.phone || "") !== (initialData.phone || ""))
        payload.phone = form.phone;
      if (
        (form.businessDescription || "") !==
        (initialData.businessDescription || "")
      )
        payload.businessDescription = form.businessDescription;
      if ((form.logoUrl || "") !== (initialData.logoUrl || ""))
        payload.logoUrl = form.logoUrl;

      if (Object.keys(payload).length > 0) {
        await onSave(payload);
      }

      setSuccess(true);
    } catch (e: unknown) {
      let msg = "حدث خطأ أثناء الحفظ";
      if (e instanceof Error) msg = e.message;
      setError(msg);
    }
  };


  return (
    <Box component="form" noValidate dir="rtl">
      <Typography variant="h6" mb={2}>
        المعلومات العامة للمتجر
      </Typography>

      {/* الشعار */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        mb={3}
        flexWrap="wrap"
      >
        <Avatar
          src={form.logoUrl}
          sx={{ width: 64, height: 64, bgcolor: "#eceff1" }}
        >
          {form.logoUrl ? null : "Logo"}
        </Avatar>
        <Button variant="outlined" component="label" disabled={logoUploading}>
          {logoUploading ? <CircularProgress size={20} /> : "تغيير الشعار"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={handleLogoUpload}
          />
        </Button>
        <Typography variant="body2" color="text.secondary">
          يُفضّل PNG/WebP بخلفية شفافة، حتى 2MB.
        </Typography>
      </Stack>

      {/* الاسم والهاتف */}
      <TextField
        label="اسم المتجر"
        value={form.name}
        onChange={(e) => handleChange("name", e.target.value)}
        fullWidth
        required
        margin="normal"
      />
      <TextField
        label="رقم الهاتف"
        value={form.phone ?? ""}
        onChange={(e) => handleChange("phone", e.target.value)}
        fullWidth
        margin="normal"
      />

     

      {/* وصف المتجر */}
      <TextField
        label="وصف المتجر"
        value={form.businessDescription ?? ""}
        onChange={(e) => handleChange("businessDescription", e.target.value)}
        fullWidth
        margin="normal"
        multiline
        rows={3}
      />

      {/* حفظ */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        sx={{ mt: 3 }}
      >
        {loading ? <CircularProgress size={22} /> : "حفظ التعديلات"}
      </Button>

      {/* Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success">تم حفظ البيانات بنجاح!</Alert>
      </Snackbar>
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Box>
  );
}
