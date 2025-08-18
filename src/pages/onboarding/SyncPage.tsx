import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material";
import { motion } from "framer-motion";
import bgShape from "../../assets/bg-shape.png";
import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";
import { getIntegrationsStatus } from "../../api/integrationsApi";
import { syncCatalog } from "../../api/catalogApi";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../utils/error";

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
    let mounted = true;
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
      if (!mounted) return;
    })();
    return () => {
      mounted = false;
    };
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
    } catch (e: unknown) {
      setError(getErrorMessage(e, "فشلت المزامنة"));
      setStatusText("فشلت المزامنة");
    } finally {
      setLoading(false);
    }
  };

  const goDashboard = () => navigate("/dashboard");

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
        overflow: "hidden",
        py: 8,
      }}
    >
      <Box
        component="img"
        src={bgShape}
        alt=""
        sx={{
          position: "absolute",
          top: { xs: -60, md: -80 },
          left: { xs: -60, md: -80 },
          width: { xs: 160, md: 300 },
          opacity: 0.18,
          zIndex: 0,
        }}
      />
      <Box
        component="img"
        src={bgShape}
        alt=""
        sx={{
          position: "absolute",
          bottom: { xs: -80, md: -100 },
          right: { xs: -60, md: -100 },
          width: { xs: 200, md: 400 },
          opacity: 0.12,
          zIndex: 0,
          transform: "rotate(180deg)",
        }}
      />

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 2 }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <Paper
            elevation={8}
            sx={{
              borderRadius: 5,
              overflow: "hidden",
              py: 5,
              px: { xs: 2, sm: 5 },
              mt: 4,
              textAlign: "center",
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Box component="img" src={logo} alt="Kaleem Logo" />
            </Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ color: "#502E91", mb: 1 }}
            >
              مزامنة المنتجات
            </Typography>
            <Typography variant="body1" sx={{ color: "#8589A0", mb: 3 }}>
              سيجري جلب المنتجات من المزوّد الخارجي وبناء فكتور للبحث الذكي
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Typography sx={{ color: "#7E66AC", mb: 2 }}>
              {statusText}
            </Typography>

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
              onClick={goDashboard}
              fullWidth
              sx={{ fontWeight: "bold", py: 1.5, borderRadius: 2 }}
            >
              الذهاب إلى لوحة التحكم
            </Button>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
