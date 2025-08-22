// src/pages/storefront/BannersManagementPage.tsx
import { useEffect, useState } from "react";
import { Box, Paper, Typography, CircularProgress, Snackbar, Alert } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import BannersEditor from "@/features/store/ui/BannersEditor";
import type { Banner, Storefront } from "@/features/mechant/storefront-theme/type";
import { getStorefrontInfo, updateStorefrontInfo } from "@/features/mechant/storefront-theme/api";

const MAX_BANNERS = 5;

export default function BannersManagementPage() {
  const { user } = useAuth();
  const merchantId = user?.merchantId ?? "";

  const [storefront, setStorefront] = useState<Storefront | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (!merchantId) return;
    getStorefrontInfo(merchantId).then(setStorefront);
  }, [merchantId]);

  const handleSaveBanners = async (banners: Banner[]) => {
    if (!merchantId) return;
    const normalized = banners
      .slice(0, MAX_BANNERS)
      .map((b, i) => ({ ...b, order: i, active: b.active ?? true }));

    try {
      setSaveLoading(true);
      const updated = await updateStorefrontInfo(merchantId, { banners: normalized });
      setStorefront((prev) => (prev ? { ...prev, banners: updated.banners ?? normalized } : prev));
      setSnackbar({ open: true, message: "تم حفظ البنرات بنجاح", severity: "success" });
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.response?.data?.message || "فشل حفظ البنرات", severity: "error" });
    } finally {
      setSaveLoading(false);
    }
  };

  if (!storefront) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", my: 6, borderRadius: 3 }}>
      <Typography variant="h5" mb={3} fontWeight="bold">
        إدارة البانرات الإعلانية
      </Typography>
      <Typography color="text.secondary" mb={4}>
        يمكنك هنا إضافة وتعديل البنرات التي تظهر في أعلى المتجر.
      </Typography>

      <BannersEditor
        merchantId={merchantId}                  // 👈 جديد
        banners={storefront?.banners || []}
        onChange={handleSaveBanners}
        loading={saveLoading}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Paper>
  );
}
