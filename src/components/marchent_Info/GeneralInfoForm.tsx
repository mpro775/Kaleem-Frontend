import { useState } from "react";
import { Box, TextField, Button, Avatar, Typography, CircularProgress, Stack, Snackbar, Alert } from "@mui/material";
import type { MerchantInfo } from "../../types/merchant";

interface GeneralInfoFormProps {
  initialData: MerchantInfo;
  onSave: (data: Partial<MerchantInfo>) => Promise<void>;
  loading?: boolean;
}

export default function GeneralInfoForm({ initialData, onSave, loading }: GeneralInfoFormProps) {
  const [form, setForm] = useState(initialData);
  const [logoUploading, setLogoUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  // رفع الشعار
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      // نفترض أن لديك api/uploadImage يرجع { url }
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploadImage", { method: "POST", body: fd });
      const { url } = await res.json();
      setForm(f => ({ ...f, logoUrl: url }));
    } catch {
      setError("فشل رفع الشعار");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await onSave(form);
      setSuccess(true);
    } catch (e: unknown) {
  let msg = "حدث خطأ أثناء الحفظ";
  if (e instanceof Error) msg = e.message;
  setError(msg);
}
  };

  return (
    <Box component="form" noValidate>
      <Typography variant="h6" mb={2}>المعلومات العامة للمتجر</Typography>
      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <Avatar src={form.logoUrl} sx={{ width: 56, height: 56 }} />
        <Button variant="outlined" component="label" disabled={logoUploading}>
          {logoUploading ? <CircularProgress size={20} /> : "تغيير الشعار"}
          <input type="file" accept="image/*" hidden onChange={handleLogoUpload} />
        </Button>
      </Stack>
      <TextField
        label="اسم المتجر"
        value={form.name}
        onChange={e => handleChange("name", e.target.value)}
        fullWidth
        required
        margin="normal"
      />
      <TextField
        label="رقم الهاتف"
        value={form.phone ?? ""}
        onChange={e => handleChange("phone", e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="رابط المتجر"
        value={form.storefrontUrl ?? ""}
        onChange={e => handleChange("storefrontUrl", e.target.value)}
        fullWidth
        margin="normal"
      />
        <TextField
          label="رابط المتجر (slug)"
          name="slug"
          value={form.slug}
  onChange={e => handleChange("slug", e.target.value)}
          helperText="مثال: myshop — يجب أن يكون باللغة الإنجليزية وبدون مسافات"
          fullWidth
        />
        {form.slug && (
  <Typography variant="body2" color="primary" mt={1}>
    رابط متجرك: <a href={`/store/${form.slug}`} target="_blank" rel="noopener noreferrer">
      {window.location.origin}/store/{form.slug}
    </a>
  </Typography>
)}

      <TextField
        label="وصف المتجر"
        value={form.businessDescription ?? ""}
        onChange={e => handleChange("businessDescription", e.target.value)}
        fullWidth
        margin="normal"
        multiline
        rows={3}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        sx={{ mt: 3 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={22} /> : "حفظ التعديلات"}
      </Button>
      {/* Snackbar للتنبيهات */}
      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert severity="success">تم حفظ البيانات بنجاح!</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Box>
  );
}
