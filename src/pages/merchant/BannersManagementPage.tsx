import { useEffect, useState } from "react";
import { Box, Paper, Typography, CircularProgress, Snackbar, Alert } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import BannersEditor from "../../components/store/BannersEditor";
import type { Banner, Storefront } from "../../types/merchant";
import { getStorefrontInfo, updateStorefrontInfo } from "../../api/storefrontApi";

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
  await updateStorefrontInfo(merchantId, { banners });
  setSaveLoading(true);
  setStorefront((prev) => prev ? { ...prev, banners } : prev);
  
};

  if (!storefront) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", my: 6, borderRadius: 3 }}>
      <Typography variant="h5" mb={3} fontWeight="bold">
        إدارة البانرات الإعلانية
      </Typography>
      <Typography color="text.secondary" mb={4}>
        يمكنك هنا إضافة وتعديل البانرات التي تظهر في أعلى المتجر.
      </Typography>
 <BannersEditor
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
