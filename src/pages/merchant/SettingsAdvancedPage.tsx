// src/pages/SettingsAdvancedPage.tsx
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/features/mechant/settings-advanced/hooks/useSettings";

// Import Presentational Components
import { ProfileSettings } from "@/features/mechant/settings-advanced/ui/ProfileSettings";
import { SecuritySettings } from "@/features/mechant/settings-advanced/ui/SecuritySettings";

export default function SettingsAdvancedPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const merchantId = user?.merchantId ?? "";

  // استدعاء الخطاف الذي يحتوي على كل المنطق
  const {
    loading,
    saving,
    profile,
    setProfile,
    // ... destructure other states and handlers
    snack,
    setSnack,
    handleSaveProfile,
    handleChangePassword,
  } = useSettings(userId, merchantId);

  if (loading) {
    return (
      <Paper sx={{ p: 2, m: "auto", maxWidth: 1200 }}>
        <Typography sx={{ mb: 1 }}>جارِ تحميل الإعدادات…</Typography>
        <LinearProgress />
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        p: { xs: 2, md: 4 },
        display: "grid",
        gap: 2,
      }}
    >
      {/* 1. مكون الملف الشخصي */}
      <ProfileSettings
        profile={profile}
        onProfileChange={(field, value) =>
          setProfile((p) => ({ ...p, [field]: value }))
        }
        onSave={handleSaveProfile}
        isSaving={!!saving.profile}
      />

      {/* 2. مكون الأمان */}
      <SecuritySettings
        onChangePassword={handleChangePassword}
        isSaving={!!saving.password}
      />

      {/* 3. مكون الإشعارات (بنفس الطريقة) */}
      {/* <NotificationSettings ... /> */}

      {/* 4. مكون مصدر المنتجات (بنفس الطريقة) */}
      {/* <ProductSourceSettings ... /> */}

      {/* 5. مكون منطقة الخطر (بنفس الطريقة) */}
      {/* <DangerZone ... /> */}

      {/* Dialog and Snackbar */}
      {/* <ConfirmPasswordDialog ... /> */}

      <Snackbar
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        autoHideDuration={4000}
      >
        <Alert severity={snack.type} variant="filled" sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
