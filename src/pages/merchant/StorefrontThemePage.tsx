// src/features/storefront-theme/StorefrontThemePage.tsx
import { Box, Paper, Typography, Button, Snackbar, Alert, Stack } from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { ColorPickerField } from "@/features/mechant/storefront-theme/ui/ColorPickerField";
import { ButtonStyleSelect } from "@/features/mechant/storefront-theme/ui/ButtonStyleSelect";
import { SlugLinkField } from "@/features/mechant/storefront-theme/ui/SlugLinkField";
import { useStorefrontTheme } from "@/features/mechant/storefront-theme/hooks";

export default function StorefrontThemePage() {
  const { user } = useAuth();
  const merchantId = user?.merchantId ?? "";

  const {
    loading,
    saveLoading,
    primaryColor,
    secondaryColor,
    buttonStyle,
    slug,
    domain,
    storeUrl,
    snackbar,
    setPrimaryColor,
    setSecondaryColor,
    setButtonStyle,
    setSlug,
    handleSave,
    closeSnackbar,
  } = useStorefrontTheme(merchantId);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <Typography>جاري التحميل…</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", my: 6, borderRadius: 3 }}>
      <Typography variant="h5" mb={1} fontWeight="bold">
        إعدادات مظهر المتجر ورابط الوصول
      </Typography>
      <Typography color="text.secondary" mb={4}>
        خصص ألوان متجرك ورابطه العام كما تريد!
      </Typography>

      <Stack direction="row" flexWrap="wrap" gap={6} mb={4}>
        <ColorPickerField
          label="لون الواجهة (Primary Color)"
          color={primaryColor}
          onChange={setPrimaryColor}
          presetColors={["#FF8500", "#1976d2", "#4caf50", "#e91e63", "#673ab7", "#ff5722"]}
        />
        <ColorPickerField
          label="اللون الثانوي (Secondary Color)"
          color={secondaryColor}
          onChange={setSecondaryColor}
          presetColors={["#1976d2", "#FF8500", "#4caf50", "#e91e63", "#673ab7", "#ff5722"]}
        />
        <ButtonStyleSelect value={buttonStyle} onChange={setButtonStyle} />
      </Stack>

      <SlugLinkField
        slug={slug}
        onSlugChange={(v) => setSlug(v.replace(/[^a-zA-Z0-9-_]/g, ""))}
        storeUrl={storeUrl}
        domain={domain}
      />

      <Button
        variant="contained"
        color="primary"
        size="large"
        sx={{
          borderRadius: buttonStyle === "rounded" ? 8 : 1,
          px: 6,
          fontWeight: "bold",
          mt: 2,
        }}
        onClick={handleSave}
        disabled={saveLoading}
      >
        {saveLoading ? "جارٍ الحفظ..." : "حفظ التغييرات"}
      </Button>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={closeSnackbar}>
        <Alert severity={snackbar.severity} onClose={closeSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
