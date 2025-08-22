// src/components/store/BannersEditor.tsx
import { Box, Button, TextField, Stack, IconButton, Switch, Typography, LinearProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Banner } from "../type";
import { useEffect, useMemo, useRef, useState } from "react";
import { uploadBannerImages } from "../api";

type BannerValue = string | number | boolean | undefined;

interface Props {
  merchantId: string;            // 👈 جديد
  banners: Banner[];
  onChange: (banners: Banner[]) => void;
  loading?: boolean;
}

const MAX_BANNERS = 5;
const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp"];
const MAX_PIXELS = 5_000_000; // 5MP

export default function BannersEditor({ merchantId, banners, onChange, loading }: Props) {
  const [localBanners, setLocalBanners] = useState<Banner[]>(banners);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLocalBanners(banners ?? []);
  }, [banners]);

  const remainingSlots = useMemo(() => Math.max(0, MAX_BANNERS - localBanners.length), [localBanners.length]);

  const handleAdd = () => {
    if (localBanners.length >= MAX_BANNERS) return;
    setLocalBanners([
      ...localBanners,
      { text: "", active: true, order: localBanners.length },
    ]);
  };

  const handleRemove = (idx: number) => {
    const newBanners = [...localBanners];
    newBanners.splice(idx, 1);
    // أعد ترقيم order
    const normalized = newBanners.map((b, i) => ({ ...b, order: i }));
    setLocalBanners(normalized);
  };

  const handleChange = (idx: number, key: keyof Banner, value: BannerValue) => {
    const newBanners = [...localBanners];
    newBanners[idx] = { ...newBanners[idx], [key]: value };
    setLocalBanners(newBanners);
  };

  const normalizeBeforeSave = (list: Banner[]) =>
    list
      .slice(0, MAX_BANNERS)
      .map((b, i) => ({ ...b, order: i, active: b.active ?? true }));

  const handleSave = () => {
    onChange(normalizeBeforeSave(localBanners));
  };

  const openFileDialog = () => fileInputRef.current?.click();

  // helper: قياس أبعاد الصورة لفلترة > 5MP قبل الإرسال
  const getImagePixels = (file: File) =>
    new Promise<number>((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const pixels = (img.naturalWidth || 0) * (img.naturalHeight || 0);
        URL.revokeObjectURL(url);
        resolve(pixels);
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
      img.src = url;
    });

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || remainingSlots <= 0) return;

    setError(null);

    // قص بعدد الخانات المتاحة
    const wanted = Array.from(files).slice(0, remainingSlots);

    // فلترة الصيغ
    const allowed = wanted.filter((f) => ALLOWED_MIME.includes(f.type));
    if (allowed.length < wanted.length) {
      setError("بعض الملفات رُفضت: يُسمح فقط PNG/JPG/WEBP.");
    }

    // فلترة 5MP (كلينت سايد فقط للـ UX، السيرفر يتحقق أيضًا)
    const finalFiles: File[] = [];
    for (const f of allowed) {
      try {
        const pixels = await getImagePixels(f);
        if (pixels <= MAX_PIXELS) {
          finalFiles.push(f);
        } else {
          setError((prev) =>
            (prev ? prev + " " : "") + `تم تخطي صورة لأنها تتجاوز 5 ميجا بكسل.`
          );
        }
      } catch {
        // لو تعذّر القياس، دع السيرفر يتحقق
        finalFiles.push(f);
      }
    }

    if (finalFiles.length === 0) return;

    try {
      setBusy(true);
      const res = await uploadBannerImages(merchantId, finalFiles);
      // أضف البنرات الجديدة مع الصور القادمة من السيرفر
      setLocalBanners((prev) => {
        const appended = [
          ...prev,
          ...res.urls.map((u, i) => ({
            image: u,
            text: "",
            active: true,
            order: prev.length + i,
          })),
        ];
        return appended.slice(0, MAX_BANNERS);
      });
    } catch (e: any) {
      setError(e?.response?.data?.message || "فشل رفع الصور.");
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Box>
      {(busy || loading) && <LinearProgress sx={{ mb: 2 }} />}

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          البنرات: {localBanners.length}/{MAX_BANNERS}
        </Typography>

        <Stack direction="row" spacing={1}>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_MIME.join(",")}
            style={{ display: "none" }}
            multiple
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
          <Button
            variant="outlined"
            onClick={openFileDialog}
            disabled={remainingSlots <= 0 || busy}
          >
            رفع صور
          </Button>
          <Button
            variant="outlined"
            onClick={handleAdd}
            disabled={localBanners.length >= MAX_BANNERS || busy}
          >
            + إضافة بانر يدوي
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={loading || busy}
          >
            حفظ التغييرات
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Typography variant="caption" color="error" sx={{ mb: 1, display: "block" }}>
          {error}
        </Typography>
      )}

      <Stack spacing={3}>
        {localBanners.map((b, idx) => (
          <Box key={idx} border={1} p={2} borderRadius={2} mb={1}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  label="عنوان البانر"
                  value={b.text}
                  onChange={(e) => handleChange(idx, "text", e.target.value)}
                  fullWidth
                />
                <Switch
                  checked={b.active ?? true}
                  onChange={(e) => handleChange(idx, "active", e.target.checked)}
                  color="success"
                />
                <IconButton onClick={() => handleRemove(idx)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Stack>

              <TextField
                label="رابط عند الضغط (اختياري)"
                value={b.url ?? ""}
                onChange={(e) => handleChange(idx, "url", e.target.value)}
                fullWidth
              />

              <TextField
                label="رابط صورة البانر (اختياري)"
                value={b.image ?? ""}
                onChange={(e) => handleChange(idx, "image", e.target.value)}
                fullWidth
              />

              <TextField
                label="لون خلفية البانر (hex أو اسم اللون)"
                value={b.color ?? ""}
                onChange={(e) => handleChange(idx, "color", e.target.value)}
                fullWidth
              />

              {/* معاينة الصورة إن وُجدت */}
              {b.image && (
                <Box sx={{ mt: 1 }}>
                  <img
                    src={b.image}
                    alt={`banner-${idx}`}
                    style={{ maxWidth: "100%", borderRadius: 8, display: "block" }}
                  />
                </Box>
              )}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
