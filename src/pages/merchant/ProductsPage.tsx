import { useState, useEffect } from "react";
import { Box, Typography, Stack, CircularProgress } from "@mui/material";

import SetupWizard from "../../components/products/SetupWizard";
import ProductsActions from "../../components/products/ProductsActions";
import ProductsTable from "../../components/products/ProductsTable";
import AddProductDialog from "../../components/products/AddProductDialog";
import { getSetupConfig, saveSetupConfig } from "../../api/productsApi";
import type { SetupConfig } from "../../types/Product";
import { useAuth } from "../../context/AuthContext";

// اجلب merchantId وtoken من الكونتكست أو Auth أو props

export default function ProductsPage() {
  const { user } = useAuth();
  const merchantId = user?.merchantId ?? "";

  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const [config, setConfig] = useState<SetupConfig | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [refresh, setRefresh] = useState(0);

  // جلب إعداد التهيئة من الباك اند عند تحميل الصفحة
  useEffect(() => {
    setPhase(0);
    getSetupConfig(merchantId)
      .then((cfg) => {
        if (cfg) {
          setConfig(cfg);
          setPhase(2);
          console.log("SetupConfig API response:", cfg); // Debug هنا
        } else {
          setPhase(1);
        }
      })
      .catch(() => setPhase(1));
  }, [merchantId, refresh]);

  const handleComplete = async (cfg: SetupConfig) => {
    await saveSetupConfig(merchantId, cfg);
    setConfig(cfg);
    setPhase(2);
  };

  return (
    <Box position="relative" minHeight="100vh" p={4} bgcolor="#f5f5f5">
      {phase === 0 && (
        <Box display="flex" justifyContent="center" mt={10}>
          <CircularProgress />
        </Box>
      )}

      {phase === 1 && (
        <Box
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
          bgcolor="rgba(255,255,255,0.9)"
          zIndex={10}
        >
          <SetupWizard onComplete={handleComplete} />
        </Box>
      )}

      {phase === 2 && config && (
        <Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
          >
            <Typography variant="h4">إدارة المنتجات</Typography>
            <Stack direction="row" spacing={2}>
              <ProductsActions
                config={config}
                onAddProduct={() => setOpenAddDialog(true)}
                // أضف هنا باقي الـ handlers إذا تريد استيراد أو رابط...
              />
              
            </Stack>
          </Box>
          <ProductsTable merchantId={merchantId} key={refresh} />
          <AddProductDialog
            open={openAddDialog}
            onClose={() => setOpenAddDialog(false)}
            merchantId={merchantId}
            onProductAdded={() => setRefresh((r) => r + 1)}
          />
        </Box>
      )}
    </Box>
  );
}
