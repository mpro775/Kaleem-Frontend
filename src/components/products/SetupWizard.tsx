import { useState } from "react";
import {
  Paper,
  Typography,
  Stack,
  Button,
  Chip,
  Divider,
  TextField,
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import ApiIcon from "@mui/icons-material/Api";

export interface SetupConfig {
  storeType: "traditional" | "ecommerce";
  provider?: "zid" | "salla" | "shopify" | "custom";
  apiUrl?: string;
  accessToken?: string;
  hasApi: boolean;
}

interface SetupWizardProps {
  onComplete: (config: SetupConfig) => void;
}

export default function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [storeType, setStoreType] = useState<"traditional" | "ecommerce">("traditional");
  const [provider, setProvider] = useState<"zid" | "salla" | "shopify" | "custom">("zid");
  const [hasApi, setHasApi] = useState(false);
  const [apiUrl, setApiUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const handleNext = () => {
    if (step === 0 && storeType === "traditional") {
      onComplete({ storeType, hasApi: false });
      return;
    }
    if (step === 2 && storeType === "ecommerce" && !hasApi) {
      onComplete({ storeType, provider, hasApi: false });
      return;
    }
    if (step === 2 && storeType === "ecommerce" && hasApi) {
      if (apiUrl && accessToken) {
        onComplete({ storeType, provider, apiUrl, accessToken, hasApi: true });
      }
      return;
    }
    setStep((s) => (s < 2 ? ((s + 1) as 1 | 2) : s));
  };

  const titleMap = [
    "الخطوة 1: هل لديك متجر إلكتروني؟",
    "الخطوة 2: اختر مزود متجرك الإلكتروني",
    "الخطوة 3: تفاصيل التكامل",
  ];

  return (
    <Paper
      elevation={3}
      sx={{ width: 450, p: 4, borderRadius: 2, textAlign: "center" }}
    >
      <Typography variant="h6" gutterBottom>
        {titleMap[step]}
      </Typography>

      {step === 0 && (
        <Stack spacing={2} mt={2}>
          <Button
            variant={storeType === "traditional" ? "contained" : "outlined"}
            startIcon={<HomeWorkIcon />}
            onClick={() => setStoreType("traditional")}
            fullWidth
          >
            لا أملك متجرًا إلكترونيًا
          </Button>
          <Button
            variant={storeType === "ecommerce" ? "contained" : "outlined"}
            startIcon={<StorefrontIcon />}
            onClick={() => setStoreType("ecommerce")}
            fullWidth
          >
            لدي متجر إلكتروني
          </Button>
        </Stack>
      )}

      {step === 1 && storeType === "ecommerce" && (
        <Stack spacing={2} mt={2}>
          {(["zid", "salla", "shopify", "custom"] as const).map((p) => (
            <Chip
              key={p}
              label={{ zid: "Zid", salla: "Salla", shopify: "Shopify", custom: "متجر شخصي" }[p]}
              clickable
              color={provider === p ? "primary" : "default"}
              onClick={() => setProvider(p)}
              sx={{ p: 2, fontSize: 16 }}
            />
          ))}
        </Stack>
      )}

      {step === 1 && storeType === "traditional" && (
        <Typography mt={2} color="text.secondary">
          نوفر لك واجهة لإدخال المنتجات يدويًّا.
        </Typography>
      )}

      {step === 2 && storeType === "ecommerce" && (
        <Stack spacing={2} mt={2}>
          <Typography>
            هل لديك API أو Access Token من{" "}
            {provider === "custom"
              ? "متجرك"
              : provider.charAt(0).toUpperCase() + provider.slice(1)}
            ؟
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant={hasApi ? "contained" : "outlined"}
              startIcon={<ApiIcon />}
              onClick={() => setHasApi(true)}
            >
              نعم لدي API
            </Button>
            <Button
              variant={!hasApi ? "contained" : "outlined"}
              onClick={() => setHasApi(false)}
            >
              لا أملك API
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            لا تقلق، لدينا حلول بديلة (رابط أو Excel).
          </Typography>
          {hasApi && (
            <Stack spacing={2} mt={2}>
              <TextField
                label="API URL"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                fullWidth
              />
              <TextField
                label="Access Token"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                fullWidth
              />
            </Stack>
          )}
        </Stack>
      )}

      <Divider sx={{ my: 3 }} />
      <Button
        variant="contained"
        fullWidth
        onClick={handleNext}
        disabled={
          step === 2 && storeType === "ecommerce" && hasApi && (!apiUrl || !accessToken)
        }
      >
        {(step === 0 && storeType === "traditional") || step === 2
          ? "إنهاء الإعداد"
          : "التالي"}
      </Button>
    </Paper>
  );
}
