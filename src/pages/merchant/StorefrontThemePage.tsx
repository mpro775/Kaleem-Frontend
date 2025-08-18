import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
} from "@mui/material";
import { SketchPicker } from "react-color";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  getStorefrontInfo,
  updateStorefrontInfo,
} from "../../api/storefrontApi";
import type { Storefront } from "../../types/merchant";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = "http://localhost:5173/store/"; // غيّر الرابط حسب نظامك

export default function StorefrontThemePage() {
  const { user } = useAuth();
  const merchantId = user?.merchantId ?? "";
  const [storefront, setStorefront] = useState<Storefront | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#FF8500");
  const [secondaryColor, setSecondaryColor] = useState("#1976d2");
  const [buttonStyle, setButtonStyle] = useState<"rounded" | "square">(
    "rounded"
  );
  const [slug, setSlug] = useState("");
  const [domain, setDomain] = useState<string | undefined>();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!merchantId) return;
    setLoading(true);
    getStorefrontInfo(merchantId)
      .then((data) => {
        setStorefront(data);
        setPrimaryColor(data.primaryColor || "#FF8500");
        setSecondaryColor(data.secondaryColor || "#1976d2");
        setButtonStyle((data.buttonStyle as "rounded" | "square") || "rounded");
        setSlug(data.slug || "");
        setDomain(data.domain);
      })
      .finally(() => setLoading(false));
  }, [merchantId]);

  // رابط المتجر
  const storeUrl = domain
    ? `https://${domain}`
    : slug
    ? `${BASE_URL}${slug}`
    : "";

  const handleCopy = () => {
    if (!storeUrl) return;
    navigator.clipboard.writeText(storeUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // **حفظ الثيم والرابط**
  const handleSave = async () => {
    if (!storefront || !storefront._id) {
      setSnackbar({
        open: true,
        message: "تعذر جلب بيانات المتجر!",
        severity: "error",
      });
      return;
    }
    if (!slug) {
      setSnackbar({
        open: true,
        message: "معرّف الرابط (slug) مطلوب",
        severity: "error",
      });
      return;
    }
    setSaveLoading(true);
    try {
      await updateStorefrontInfo(storefront._id, {
        primaryColor,
        secondaryColor,
        buttonStyle,
        slug,
      });
      setStorefront((prev) =>
        prev
          ? {
              ...prev,
              primaryColor,
              secondaryColor,
              buttonStyle,
              slug,
            }
          : prev
      );
      setSnackbar({
        open: true,
        message: "تم حفظ إعدادات الثيم بنجاح!",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "حدث خطأ أثناء الحفظ",
        severity: "error",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading || !storefront) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", my: 6, borderRadius: 3 }}>
      <Typography variant="h5" mb={3} fontWeight="bold">
        إعدادات مظهر المتجر ورابط الوصول
      </Typography>
      <Typography color="text.secondary" mb={4}>
        خصص ألوان متجرك ورابطه العام كما تريد!
      </Typography>

      <Box sx={{ display: "flex", gap: 6, flexWrap: "wrap", mb: 4 }}>
        {/* Primary Color */}
        <Box>
          <Typography fontWeight="bold" mb={2}>
            لون الواجهة (Primary Color):
          </Typography>
          <SketchPicker
            color={primaryColor}
            onChangeComplete={(c) => setPrimaryColor(c.hex)}
            presetColors={[
              "#FF8500",
              "#1976d2",
              "#4caf50",
              "#e91e63",
              "#673ab7",
              "#ff5722",
            ]}
            styles={{
              default: { picker: { boxShadow: "0 2px 16px rgba(0,0,0,0.07)" } },
            }}
          />
        </Box>
        {/* Secondary Color */}
        <Box>
          <Typography fontWeight="bold" mb={2}>
            اللون الثانوي (Secondary Color):
          </Typography>
          <SketchPicker
            color={secondaryColor}
            onChangeComplete={(c) => setSecondaryColor(c.hex)}
            presetColors={[
              "#1976d2",
              "#FF8500",
              "#4caf50",
              "#e91e63",
              "#673ab7",
              "#ff5722",
            ]}
            styles={{
              default: { picker: { boxShadow: "0 2px 16px rgba(0,0,0,0.07)" } },
            }}
          />
        </Box>
        {/* Button Style */}
        <Box minWidth={220}>
          <Typography fontWeight="bold" mb={2}>
            أسلوب الأزرار:
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="btn-style-label">أسلوب الأزرار</InputLabel>
            <Select
              labelId="btn-style-label"
              value={buttonStyle}
              label="أسلوب الأزرار"
              onChange={(e) =>
                setButtonStyle(e.target.value as "rounded" | "square")
              }
            >
              <MenuItem value="rounded">دائري الزوايا (مستدير)</MenuItem>
              <MenuItem value="square">مربع الزوايا (مستطيل)</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Slug + رابط المتجر */}
      <Box mb={4} mt={2} maxWidth={450}>
        <Typography fontWeight="bold" mb={1}>
          رابط المتجر <span style={{ color: "#999" }}>(Slug)</span>
        </Typography>
        <TextField
          label="معرّف الرابط (slug)"
          value={slug}
          onChange={(e) =>
            setSlug(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""))
          }
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  onClick={handleCopy}
                  startIcon={<ContentCopyIcon />}
                  disabled={!storeUrl}
                  size="small"
                  sx={{ minWidth: 0, px: 1, fontSize: 13 }}
                >
                  {copySuccess ? "تم النسخ" : "نسخ"}
                </Button>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        <Box>
          <Typography variant="body2" sx={{ color: "#666" }}>
            رابط متجرك الحالي:
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "primary.main",
              fontWeight: "bold",
              wordBreak: "break-all",
              mt: 0.5,
            }}
          >
            {storeUrl || "لم يتم تعيين الرابط بعد"}
          </Typography>
        </Box>
      </Box>

      <Button
        variant="contained"
        color="primary"
        size="large"
        sx={{
          borderRadius: buttonStyle === "rounded" ? 8 : 1,
          px: 6,
          fontWeight: "bold",
        }}
        onClick={handleSave}
        disabled={saveLoading}
      >
        {saveLoading ? "جارٍ الحفظ..." : "حفظ التغييرات"}
      </Button>

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
