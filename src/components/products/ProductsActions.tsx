import { Button, Stack, Paper, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import type { SetupConfig } from "./SetupWizard"; // عدّل المسار حسب مكانك الفعلي

interface ProductsActionsProps {
  config: SetupConfig | null;
  onAddProduct?: () => void;
  onImportByLink?: () => void;
  onImportByExcel?: () => void;
}

export default function ProductsActions({
  config,
  onAddProduct,
  onImportByLink,
  onImportByExcel,
}: ProductsActionsProps) {
  if (!config) return null;

  if (config.hasApi) {
    return (
      <Paper sx={{ p: 2, bgcolor: "info.light" }}>
        <Typography color="info.main">
          منتجاتك يتم مزامنتها مباشرة مع متجرك، لا داعي لإضافتها هنا.
        </Typography>
      </Paper>
    );
  }
  return (
    <Stack direction="row" spacing={2}>
      <Button variant="contained" startIcon={<AddIcon />} onClick={onAddProduct}>
        إضافة منتج جديد
      </Button>
      <Button
        variant="outlined"
        startIcon={<LinkIcon />}
        disabled={config.storeType === "traditional"}
        onClick={onImportByLink}
      >
        إضافة عبر رابط
      </Button>
      <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={onImportByExcel}>
        استيراد من Excel
      </Button>
    </Stack>
  );
}
