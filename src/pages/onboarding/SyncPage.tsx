// src/pages/onboarding/SyncPage.tsx
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getIntegrationsStatus } from "@/api/integrationsApi";
import { syncCatalog } from "@/api/catalogApi";
import { getAxiosMessage } from "@/shared/lib/errors";
import OnboardingLayout from "@/widgets/onboarding/OnboardingLayout";

export default function SyncPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [statusText, setStatusText] = useState<string>("جاهز للمزامنة");
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState<number | null>(null);
  const [updated, setUpdated] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        const st = await getIntegrationsStatus(token);
        const connected = st.salla?.connected || st.zid?.connected;
        if (!connected)
          setStatusText("لم يتم ربط مزود خارجي بعد. يمكنك المتابعة لاحقًا.");
      } catch {
        /* تجاهل */
      }
    })();
  }, [token]);

  const handleSync = async () => {
    if (!user?.merchantId || !token) return;
    setError(null);
    setLoading(true);
    setImported(null);
    setUpdated(null);
    setStatusText("جارٍ المزامنة وبناء الفكتور…");
    try {
      const res = await syncCatalog(user.merchantId, token);
      setImported(res.imported || 0);
      setUpdated(res.updated || 0);
      setStatusText("اكتملت المزامنة!");
    } catch (e) {
      setError(getAxiosMessage(e, "فشلت المزامنة"));
      setStatusText("فشلت المزامنة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout
      step={3}
      total={3}
      title={
        <Typography variant="h4" fontWeight="bold" sx={{ color: "#502E91" }}>
          مزامنة المنتجات
        </Typography>
      }
      subtitle={
        <Typography variant="body1" sx={{ color: "#8589A0" }}>
          جلب المنتجات وبناء فكتور للبحث الذكي
        </Typography>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography sx={{ color: "#7E66AC", mb: 2 }}>{statusText}</Typography>

      {imported !== null && updated !== null && (
        <Typography sx={{ color: "#8589A0", mb: 2 }}>
          تم استيراد <b>{imported}</b> وتحديث <b>{updated}</b> منتجًا.
        </Typography>
      )}

      <Button
        variant="contained"
        onClick={handleSync}
        disabled={loading}
        fullWidth
        sx={{
          fontWeight: "bold",
          py: 1.5,
          borderRadius: 2,
          mb: 2,
          background: "linear-gradient(90deg, #A498CB, #502E91)",
        }}
      >
        {loading ? (
          <CircularProgress size={22} color="inherit" />
        ) : (
          "مزامنة الآن"
        )}
      </Button>

      <Button
        variant="outlined"
        onClick={() => navigate("/dashboard")}
        fullWidth
        sx={{ fontWeight: "bold", py: 1.5, borderRadius: 2 }}
      >
        الذهاب إلى لوحة التحكم
      </Button>
    </OnboardingLayout>
  );
}
